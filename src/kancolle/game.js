'use strict'

const KANCOLLE_MASTER_SERVER = process.env.KANCOLLE_SERVER_MASTER
const rp = require('request-promise')
const log = require('../logger')('service:kancolle')
const sprintf = require('sprintf-js').sprintf

const Kancolle = {

  ENTRY_HOST: KANCOLLE_MASTER_SERVER,

  fetchConfig: function() {
    const url = `http://${this.ENTRY_HOST}/gadget/js/kcs_const.js`

    log.info('get Kancolle configuration file', url)
    return rp.get({url})
    .then(jsCode => {
      log.info('extract Kancolle server IP addresses, URL info, and maintenance info')
      log.verbose('append js code to output variable value')
      const var2export = sprintf('JSON.stringify({%s, %s, %s})',
        'ConstServerInfo', 'ConstURLInfo', 'MaintenanceInfo')
      jsCode += ';' + var2export

      log.verbose(`emulate javascripts assuming that code from ${url} is trusted`)
      const json = JSON.parse(eval(jsCode))
      log.debug('parsed json result', json)
      return Promise.resolve(json)
    })
  },

  getMaintenanceInfo: function() {
    log.info('get maintenance information')
    return this.fetchConfig()
    .then(kcs_config => {
      const maintenanceInfo = kcs_config.MaintenanceInfo
      const isMaintain = Boolean(maintenanceInfo.IsDoing) || Boolean(maintenanceInfo.IsEmergency)
      maintenanceInfo.isMaintain = isMaintain
      delete maintenanceInfo.IsDoing
      delete maintenanceInfo.IsEmergency
      return Promise.resolve(maintenanceInfo)
    })
  },

  getWorldServerId: function(gadgetInfo) {
    const now = Date.now()
    const uri = `${this.ENTRY_HOST}/kcsapi/api_world/get_id/${gadgetInfo.VIEWER_ID}/1/${now}`

    log.info(`call ${uri} to findout ${gadgetInfo.VIEWER_ID} reside in which Kancolle server`)
    return rp.get({uri})
    .then(response => {
      log.debug('remove "svndata=" and parse JSON')
      response = response.replace('svdata=', '')
      response = JSON.parse(response)
      log.debug('parsed result', response)

      if(response.api_result != 1) {
        const error = new Error(`Internal error at target server ${this.ENTRY_HOST}`)
        log.error(`${error.message} -- On maintenance?`, response)
        return Promise.reject(error)
      }

      const worldId = response.api_data.api_world_id
      log.info(`${gadgetInfo.VIEWER_ID} reside in world id ${worldId}`)
      return Promise.resolve(worldId)
    })
  }
}

module.exports = Kancolle

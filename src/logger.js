'use strict'

const LOGGER_COMMON_SILENT = process.env.LOGGER_COMMON_SILENT
const LOGGER_KCAPI_SILENT = process.env.LOGGER_KCAPI_SILENT
const LOGGER_LEVEL = process.env.LOGGER_LEVEL

const winston = require('winston')
const labels = ['app:middleware', 'app:router', 'service:dmm', 'service:kancolle']
const kancolleApi = 'kancolle:api'

module.exports = function(label) {
  return winston.loggers.get(label)
}

labels.forEach(label => newWinstonLoggerCommonConfig(label))
configureKcApiLogger(kancolleApi)

function newWinstonLoggerCommonConfig(label) {
  const loggerConfig = {
    console: {
      label: label,
      level: LOGGER_LEVEL,
      colorize: true,
      silent: LOGGER_COMMON_SILENT === 'true',
      timestamp: true,
      prettyPrint: false,
    }
  }
  winston.loggers.add(label, loggerConfig)
}

function configureKcApiLogger(label) {
  winston.loggers.add(label, {
    console: {
      label: label,
      level: LOGGER_LEVEL,
      silent: LOGGER_KCAPI_SILENT === 'true'
    }
  })
}

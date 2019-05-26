/*
 * Copyright 2018 Teppo Kurki <teppo.kurki@iki.fi>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const mapping = {
  "1w.28FF8C9560163C3": 1,
  "1w.28FF165C6016363": 2,
  "1w.28FF9E856016487": 3,
  "1w.28FFC36660163BC": 4
}

module.exports = function (app) {
  const error =
    app.error ||
    (msg => {
      console.error(msg)
    })
  const debug =
    app.debug ||
    (msg => {
      console.log(msg)
    })

  const plugin = {}
  const unsubscribes = []
  let statusMessage = 'Not started'

  let socket
  plugin.start = function (props) {
    socket = require('dgram').createSocket('udp4')
    socket.on('message', function (message) {
      const msg = JSON.parse(message.toString().replace(',"va', '","va'))
      debug(JSON.stringify(msg))
      statusMessage = msg
      msg.updates[0].values[0].path =
        'propulsion.1.temperatures.' + mapping[msg.updates[0]['$source']]
    })
    socket.bind(props.port)
    statusMessage = `Started on port ${props.port}, nothing received yet`
  }

  plugin.stop = function () {
    if(socket) {
      socket.close(() => {
        debug('Closed')
        statusMessage = 'Not listening'
      })
    }
    socket = undefined
  }

  plugin.statusMessage = function () {
    return statusMessage
  }

  plugin.id = 'cassiopeia-udp'
  plugin.name = 'Cassiopeia UDP Receiver'
  plugin.description = ''

  plugin.schema = {
    type: 'object',
    required: ['port'],
    properties: {
      port: {
        type: 'number',
        default: 8888
      },
      mappings: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            dollarSource: {
              type: 'string'
            },
            path: {
              type: 'string'
            }
          }
        }
      }
    }
  }

  return plugin
}

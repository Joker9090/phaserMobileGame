/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
        startGame();
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        // var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        // var receivedElement = parentElement.querySelector('.received');
        //
        // listeningElement.setAttribute('style', 'display:none;');
        // receivedElement.setAttribute('style', 'display:block;');
        //
        // console.log('Received Event: ' + id);
    }
};

function startGame() {
  window.screen.orientation.lock('landscape');

  var game = new Phaser.Game(window.innerHeight, window.innerWidth, Phaser.AUTO, 'test', null, true, false);

  var BasicGame = function (game) { };

  BasicGame.Boot = function (game) { };

  var isoGroup, cursorPos, cursor;

  BasicGame.Boot.prototype =
  {
      preload: function () {
          game.load.image('tile', 'img/assets/tile.png');
          game.load.atlasJSONHash('tileMap', 'img/assets/tilesetmelkas.png', 'img/assets/tilesetmelkas.json');

          game.time.advancedTiming = true;

          // Add and enable the plug-in.
          game.plugins.add(new Phaser.Plugin.Isometric(game));

          // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
          // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
          game.iso.anchor.setTo(0.5, 0.2);


      },
      create: function () {

          // Create a group for our tiles.
          isoGroup = game.add.group();

          // Let's make a load of tiles on a grid.
          this.spawnTiles();

          // Provide a 3D position for the cursor
          cursorPos = new Phaser.Plugin.Isometric.Point3();
      },
      update: function () {
          // Update the cursor position.
          // It's important to understand that screen-to-isometric projection means you have to specify a z position manually, as this cannot be easily
          // determined from the 2D pointer position without extra trickery. By default, the z position is 0 if not set.
          game.iso.unproject(game.input.activePointer.position, cursorPos);

          // Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
          isoGroup.forEach(function (tile) {
              var inBounds = tile.isoBounds.containsXY(cursorPos.x, cursorPos.y);
              // If it does, do a little animation and tint change.
              if (!tile.selected && inBounds) {
                  tile.selected = true;
                  tile.tint = 0x86bfda;
                  game.add.tween(tile).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);
              }
              // If not, revert back to how it was.
              else if (tile.selected && !inBounds) {
                  tile.selected = false;
                  tile.tint = 0xffffff;
                  game.add.tween(tile).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
              }
          });
      },
      render: function () {
          game.debug.text("Move your mouse around!", 2, 36, "#ffffff");
          game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
      },
      doMap(number){
        function readTextFile(file,fileDataReturn) {
          var rawFile = new XMLHttpRequest();
          rawFile.open("GET", file, false);
          rawFile.onreadystatechange = function ()
          {
              if(rawFile.readyState === 4)
              {
                  if(rawFile.status === 200 || rawFile.status == 0)
                  {
                      var allText = rawFile.responseText;
                      fileDataReturn(allText);
                  }
              }
          }
          rawFile.send(null);
        }
        function getAssetForNumer(n){
          switch (parseInt(n)) {
            case 0: return 'water'; break;
            case 1: return 'sand'; break;
            case 2: return 'grass'; break;
            case 3: return 'stone'; break;
            case 4: return 'wood'; break;
            case 5: return 'watersand'; break;
            case 6: return 'grasssand'; break;
            case 7: return 'sandstone'; break;
            case 8: return 'bush1'; break;
            case 9: return 'bush2'; break;
            case 10: return 'mushroom'; break;
            case 11: return 'wall'; break;
            case 12: return 'window'; break;
            default: return false;
          }
        }
        var sizeOfBlock = 38;
        readTextFile("maps/"+number+".map",function(mapData){
          var mapLines = mapData.split('\n'); //lines
          for (var i = 0; i < mapLines.length; i++) {
              var mapRows = mapLines[i].split(/\s+/); //rows
              for (var k = 0; k < mapRows.length; k++) {
                if(getAssetForNumer(mapRows[k])){
                  tile = game.add.isoSprite(i*sizeOfBlock, k*sizeOfBlock, 0, 'tileMap', getAssetForNumer(mapRows[k]), isoGroup);
                  tile.anchor.set(0.5, 1);
                  tile.smoothed = false;
                  if (mapRows[k] === 4) tile.isoZ += 6;
                }
              }
          }
        })
      },
      spawnTiles: function () {
          var tile;
          this.doMap(1);
      }
  };

  game.state.add('Boot', BasicGame.Boot);
  game.state.start('Boot');
}

app.initialize();

/////////////////////////////////////////////////////////////
                    /* ВАЖНЫЕ ПЕРМЕННЫЕ */
                    let colshape;
                    let colshapeMarker;
                    let trackMarker;
                    let trackColshape;
                    let showWork;
                    let playerLocal = mp.players.local
                    let workStatus = 0;
                    let muleSpawn = { x: -267.8572692871094, y: 2193.226806640625, z: 130.0386199951172, heading: -118.64833068847656}
                    let trackSpawn = { x: -230.88673400878906, y: 2081.921142578125, z: 138.77877807617188 }
                    let redColor = [255,0,0,100]
                    // let playerVehicle = null;
                                        /* ВАЖНЫЕ ПЕРМЕННЫЕ */                  
                    /////////////////////////////////////////////////////////////
                    
                    /////////////////////////////////////////////////////////////
                                        /* РАЗНЫЕ ФУНКЦИИ */
                                        const spawnVehicleNearPlayer = (vehicleName, offsetX = 5, offsetY = 0) => {
                                            // Получаем позицию игрока
                                            const playerPos = mp.players.local.position;
                                        
                                            // Рассчитываем новую позицию для спавна транспорта с заданными смещениями
                                            const spawnPos = new mp.Vector3(playerPos.x + offsetX, playerPos.y + offsetY, playerPos.z);
                                        
                                            // Определяем угол разворота на основе угла игрока
                                            const heading = mp.players.local.heading;
                                        
                                            // Создаем транспортное средство
                                            mp.vehicles.new(
                                                mp.game.joaat(vehicleName),
                                                spawnPos,
                                                {
                                                    heading: heading,
                                                    dimension: mp.players.local.dimension
                                                }
                                            );
                                        
                                            // Выводим уведомление в чат
                                            mp.gui.chat.push(`Транспорт ${vehicleName} заспавнен рядом с вами!`);
                                        };





                    const playerInitWork = (marker) => {
                        colshapeSphere = mp.colshapes.newSphere(marker.x, marker.y ,marker.z+1, 2)
                        colshapeMarker = mp.markers.new(1, [marker.x+1, marker.y, marker.z+1], 1, {color: redColor});
                        mp.peds.new(
                            mp.game.joaat('cs_dreyfuss'), 
                            [marker.x, marker.y ,marker.z+2, 1],
                            260.0,
                            playerLocal.dimension
                        );
                    }
                    const beginWork = () => {
                        showWork.execute("mp.invoke('focus', false)")
                        showWork.active = false
                        mp.game.graphics.stopScreenEffect("ChopVision")
                        mp.gui.chat.activate(true)
                    }
                    const workNotify = (msgText) => {
                        mp.game.ui.setNotificationTextEntry('STRING');
                        mp.game.ui.setNotificationMessage('CHAR_RON', 'CHAR_RON', false, 2, 'Новое сообщение', msgText);
                    };
                    const spawnVehiclesForWork = (carName, carSpawn) => {
                            mp.vehicles.new(mp.game.joaat(carName), carSpawn, {heading: carSpawn.heading})
                    }
                    const startColshape = () => {
                        showWork = mp.browsers.new('package://freeroam/cef/index.html')
                        showWork.execute("mp.invoke('focus', true)")
                        mp.gui.chat.activate(false)
                        mp.game.graphics.startScreenEffect("ChopVision", 0, true)
                    }
                    
                    const setCheckPoint = () => {
                        trackColshape = mp.colshapes.newSphere(trackSpawn.x, trackSpawn.y, trackSpawn.z, 3)
                        trackMarker = mp.markers.new(1, [trackSpawn.x, trackSpawn.y, trackSpawn.z-2], 3, {color: redColor, visible: true});
                        trackBlip = mp.blips.new(431, [trackSpawn.x, trackSpawn.y, trackSpawn.z], {shortRange: false});
                        trackBlip.setRoute(true);
                    }
                    const vehicleCheck = () => {
                        if(!playerLocal.vehicle) {
                            workNotify('Вы не можете доставить груз на ногах!')
                            return false;
                        }
                        return true;
                    }
                    const clearTrack = () => {
                        trackColshape.destroy();
                        trackMarker.destroy();
                        trackBlip.destroy()
                    }
                    const startTrackShape = () => {
                        if(!vehicleCheck()) return mp.gui.chat.push("Вы должны быть в транспорте.")
                        clearTrack()
                        workStatus = 0
                    }
                                        /* РАЗНЫЕ ФУНКЦИИ */                  
                    /////////////////////////////////////////////////////////////     
                    
                    /////////////////////////////////////////////////////////////
                                        /* ВЫЗОВ ИВЕНТОВ */
                    mp.events.add('playerInitLogistWork', (markerPos) => {
                        playerInitWork(markerPos)
                    })   
                    /////////////////////////////////////////////////////////////
                    mp.events.add('playerEnterColshape', (colshape) => {
                        if( colshape == colshapeSphere ) {
                            startColshape()
                        }
                        if(colshape == trackColshape) {
                            startTrackShape()
                            workNotify('Ты доставил груз. Возвращайся!')
                        }
                    })   
                    //////////////////////////////////////////////////////////////
                    mp.events.add('beginWork', () => {
                        if(workStatus == 1 ) {
                            beginWork()
                            workNotify('Вы уже начали работу!')
                        } 
                        else {
                            beginWork()
                            spawnVehiclesForWork('mule3', muleSpawn)
                            workNotify('Начинайте развозить товары!')
                            workStatus = 1
                        }
                    })   
                    //////////////////////////////////////////////////////////////
                    mp.events.add('playerEnterVehicle', () => {
                        if(workStatus == 1) {
                            setCheckPoint()
                        }
                    })         
                                        /* ВЫЗОВ ИВЕНТОВ */                  
                    /////////////////////////////////////////////////////////////     
                    mp.events.add('playerSpawn', () => {
                        // Поскольку при спавне игрока модель и позиция уже определены,
                        // можно сразу создать транспортное средство рядом с игроком.
                        mp.gui.chat.push('Событие playerSpawn вызвано!'); // Добавьте это
                        spawnVehicleNearPlayer('adder', 5, 0);
                    });

                    spawnVehicleNearPlayer('adder', 5, 0);

                    mp.events.call('beginWork')
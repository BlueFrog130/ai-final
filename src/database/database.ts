import { Board } from '@/models/board';
import { Game } from '@/models/game';
import { Log } from '@/models/log';
import { Player } from '@/models/player';
import { INeuralNetworkJSON, NeuralNetwork } from "brain.js";
import { classToPlain, plainToClass } from "class-transformer";
import Vue from "vue"

declare module "vue/types/vue" {
    interface Vue {
        $db: IDBDatabase;
    }
}

let db: IDBDatabase | null = null;

async function init() {
    const request = indexedDB.open("PokerDatabase", 7);
    await new Promise((res, rej) => {
        request.onerror = function(e) {
            console.error("No access to IndexedDB");
            console.log(e);
            db = null;
            return rej(e);
        }

        request.onsuccess = function(e) {
            db = <IDBDatabase> (e.target as any).result;
            return res();
        }

        request.onupgradeneeded = function(e) {
            db = <IDBDatabase> (e.target as any).result;
            if(e.oldVersion < 3) {
                db.createObjectStore("games", { keyPath: "id" });
                db.createObjectStore("boards", { keyPath: "id" });
                db.createObjectStore("players", { keyPath: "id" });
                return res();
            }
            if(e.oldVersion < 4) {
                db.createObjectStore("data", { keyPath: "id", autoIncrement: true })
            }
            if(e.oldVersion < 5) {
                db.createObjectStore("nets", { keyPath: "player" })
            }
            if(e.oldVersion < 6) {
                db.deleteObjectStore("nets");
            },
            if(e.oldVersion < 7) {
                db.transaction("data").objectStore("data").clear();
            }
        }
    });

    Vue.prototype.$db = db;
}

init();

function getStore<T extends object>(item: T) {
    switch(item.constructor) {
        case Game:
            return "games";
        case Board:
            return "boards";
        case Player:
            return "players";
        case Log:
            return "data";
        default:
            throw new Error("Did not recognize item");
    }
}

function getStoreFromType(type: new(...args: any[]) => any) {
    switch(type) {
        case Game:
            return "games";
        case Board:
            return "boards";
        case Player:
            return "players";
        case Log:
            return "data";
        default:
            throw new Error("Did not recognize item");
    }
}

export const repository = {
    async getGames() {
        return new Promise<Game[]>((res, rej) => {
            let request = db?.transaction("games").objectStore("games").getAll();
            if(!request) {
                return rej("No database");
            }
            request.onerror = function(event) {
                return rej(event);
            }
            request.onsuccess = function(event) {
                return res((<any> event.target).result);
            }
        })
    },
    async add<T extends object>(item: T) {
        let name = getStore(item);
        return new Promise((res, rej) => {
            let transaction = db?.transaction(name, "readwrite");
            if(!transaction) {
                return rej("No database");
            }
            transaction.onerror = function(e) {
                return rej(e);
            }
            transaction.oncomplete = function(e) {
                return res();
            }
            let request = transaction.objectStore(name).add(classToPlain(item));
            request.onerror = function(e) {
                return rej(e);
            }
        })
    },
    async get<T extends object>(type: new(...args: any[]) => T, id: string) {
        let name = getStoreFromType(type);
        return new Promise<T>((res, rej) => {
            let request = db?.transaction(name).objectStore(name).get(id);
            if(!request) {
                return rej("No database");
            }
            request.onerror = function(event) {
                return rej(event);
            }
            request.onsuccess = function(event) {
                return res((<any> event.target).result);
            }
        })
    },
    async clear<T extends object>(item: T) {
        let name = getStore(item);
        return new Promise((res, rej) => {
            let request = db?.transaction(name, "readwrite").objectStore(name).clear();
            if(request) {
                request.onerror = function(e) {
                    return rej(e);
                }
                request.onsuccess = function(e) {
                    return res(e);
                }
            }
            else {
                return res();
            }
        })
    },
    async delete<T extends { id: string }>(item: T) {
        let name = getStore(item);
        return new Promise((res, rej) => {
            let request = db?.transaction(name, "readwrite").objectStore(name).delete(item.id);
            if(request) {
                request.onerror = function(e) {
                    return rej(e);
                }
                request.onsuccess = function(e) {
                    return res(e);
                }
            }
            else {
                return res();
            }
        })
    },
    async deleteItem<T>(type: new(...args: any[]) => T, id: string) {
        let name = getStoreFromType(type);
        return new Promise((res, rej) => {
            let request = db?.transaction(name, "readwrite").objectStore(name).delete(id);
            if(request) {
                request.onerror = function(e) {
                    return rej(e);
                }
                request.onsuccess = function(e) {
                    return res(e);
                }
            }
            else {
                return res();
            }
        })
    },
    async getBaseData() {
        return new Promise<Log[]>((res, rej) => {
            let req =  db?.transaction("data").objectStore("data").openCursor();
            let baseData: Log[] = [];
            if(req) {
                req.onsuccess = function(e) {
                    let cursor = (<any> e.target)?.result
                    if(cursor) {
                        let log = plainToClass(Log, cursor.value);
                        if(!log.player) {
                            baseData.push(log);
                        }
                        cursor.continue();
                    }
                    else {
                        res(baseData);
                    }
                }
            }
            else {
                return rej();
            }
        });
    },
    async getPlayerData(id: string) {
        return new Promise<Log[]>((res, rej) => {
            let req =  db?.transaction("data").objectStore("data").openCursor();
            let data: Log[] = [];
            if(req) {
                req.onsuccess = function(e) {
                    let cursor = (<any> e.target)?.result
                    if(cursor) {
                        let log = plainToClass(Log, cursor.value);
                        if(log.player === id) {
                            data.push(log);
                        }
                        cursor.continue();
                    }
                    else {
                        res(data);
                    }
                }
            }
            else {
                return rej();
            }
        });
    }
}
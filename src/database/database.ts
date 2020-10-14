import Vue from "vue"

declare module "vue/types/vue" {
    interface Vue {
        $db: IDBDatabase;
    }
}

let db: IDBDatabase | null = null;

async function init() {
    const request = indexedDB.open("PokerDatabase", 3);
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
            db.createObjectStore("games", { keyPath: "id" });
            db.createObjectStore("boards", { keyPath: "id" });
            db.createObjectStore("players", { keyPath: "id" });
            return res();
        }
    });

    Vue.prototype.$db = db;
}

init();

export const repository = {
    getGames() {

    }
}
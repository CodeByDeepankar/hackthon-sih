// frontend/lib/db.js
// Lazy-initialize PouchDB only in the browser to avoid "self is not defined" on the server.

let dbInstance = null;

export default async function getDB() {
  if (dbInstance) return dbInstance;

  // Ensure this only runs in the browser
  if (typeof window === "undefined") {
    throw new Error("PouchDB is only available in the browser environment");
  }

  const { default: PouchDB } = await import("pouchdb-browser");

  const localDB = new PouchDB("students");
  const remoteDB = new PouchDB("http://deep:1234@127.0.0.1:5984/students");

  // Auto sync (offline → online)
  localDB.sync(remoteDB, {
    live: true,
    retry: true,
  });

  dbInstance = localDB;
  return dbInstance;
}

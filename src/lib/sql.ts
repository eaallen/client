import { Database } from "sql.js";
import parseCSV from "./csv";

export async function loadCSVIntoSQLite( db: Database, fileName: string, csv: string) {
    const data = parseCSV(csv)
    const header = data.shift()
    if (!header) { throw new Error("no header") }

    const tableName = fileName.split(" ").join("_").split("-").join("_")

    const makeTable = `create table ${tableName}(${header.toString()});`
    console.log(makeTable);
    const insertStart =`INSERT INTO ${tableName} VALUES ${data.map(items=> `(${items.map(x=>`"${x}"`).toString()})`)};`
    console.log(insertStart)

    // const SQL = await window.initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm` })
    // const db = new SQL.Database();
    console.log("load DB");

    db.run(makeTable)
    db.run(insertStart)

    // const resp = db.exec(`SELECT * FROM ${fileName}`)

    return db
}

interface DBInputData {
    filename: string
    csv: string
}
export async function initDB(inputData: DBInputData[]){
    const SQL = await window.initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm` })
    const db = new SQL.Database();
    for (const {filename, csv} of inputData) {
        loadCSVIntoSQLite(db, filename, csv)
    }
    return db
}

export default class SQLite {
    private db: Database

    private constructor(db: Database){
        this.db = db
    }

    static async initDB(inputData: DBInputData[]){
        const db = await initDB(inputData)
        return new SQLite(db)
    }
    run(statement: string){
        this.db?.run(statement)
    }
    exec(statement: string){
        return this.db?.exec(statement)
    }
    getDB(){
        return this.db
    }
}
import { Database, QueryExecResult } from "sql.js";
import parseCSV from "./csv";

export async function loadCSVIntoSQLite(db: Database, fileName: string, csv: string) {
    const data = parseCSV(csv)
    const header = data.shift()
    if (!header) { throw new Error("no header") }

    const tableName = fileName.split(" ").join("_").split("-").join("_")

    const makeTable = `create table ${tableName}(${header.toString()});`
    console.log(makeTable);
    const insertStart = `INSERT INTO ${tableName} VALUES ${data.map(items => `(${items.map(x => `"${x}"`).toString()})`)};`
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
export async function initDB(inputData: DBInputData[]) {
    const SQL = await window.initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm` })
    const db = new SQL.Database();
    for (const { filename, csv } of inputData) {
        loadCSVIntoSQLite(db, filename, csv)
    }
    return db
}

export type TableSchemas = {
    [tableName: string]: QueryExecResult[];
}[]

export default class DB {
    private db: Database

    private constructor(db: Database) {
        this.db = db
    }

    static async init(inputData: DBInputData[]) {
        const db = await initDB(inputData)
        return new DB(db)
    }
    run(statement: string) {
        this.db.run(statement)
    }
    exec(statement: string) {
        return this.db.exec(statement)
    }
    getDatabase() {
        return this.db
    }
    loadCSV(fileName: string, csv: string) {
        loadCSVIntoSQLite(this.db, fileName, csv)
    }
    /**
     * @returns list of table names in the database
     */
    getTableNames() {
        const result = this.exec("SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name;")
        return result.shift()?.values
    }
    /**
     * @returns A list of all the column names per table in the database
     */
    getTableSchemas(): TableSchemas {
        const tableNames = this.getTableNames() || []
        const schemas = []
        for (const tableName of tableNames) {
            const name: string | undefined = tableName[0]?.toString()
            if (name) {
                schemas.push({ [name]: this.exec(`PRAGMA table_info(${tableName[0]});`) })
            }
        }
        return schemas
    }
    /**
     * converts the current tables in the DB into a JSON string which can be 
     * given to roadrunner AI to consume as context to query
     * TODO: Optimize (remove data we dont need in the string schema)
     */
    convertTableSchemasIntoRoadRunnerAIInput(): string {
        const tableSchemas = this.getTableSchemas()
        return JSON.stringify(tableSchemas)
    }
}
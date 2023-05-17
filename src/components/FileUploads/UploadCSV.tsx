import React from "react"
import parseCSV from "../../lib/csv";
import SQLite, { initDB } from "../../lib/sql";

export default function UploadCSV() {
    const [data, setData] = React.useState({})
    function onChange(event: React.ChangeEvent<HTMLInputElement>){
        const files = event.target.files ?? [];
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            const reader = new FileReader();
            reader.onload = async (e) => {
                const contents = e.target?.result as string | null // marking as string sinde we call readAsText
                if (contents) {
                    const csvData = parseCSV(contents)
                    console.log(csvData);
                    // setData({...data, [file.name]: csvData})
                    const db = await SQLite.initDB([{filename: file.name, csv: contents}])
                    console.log(db.exec("SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name"))
                }
            }
            reader.readAsText(file)
        }
    }
    console.log(data)
    return <input type="file" onChange={onChange}/>
}
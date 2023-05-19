import React from "react"
import parseCSV from "../../lib/csv";
import DB from "../../lib/sql";

interface Props {
    uploadDataToDB: (filename: string, csv: string)=>void
}

export default function UploadCSV(props: Props) {
    const [data, setData] = React.useState({})
    function onChange(event: React.ChangeEvent<HTMLInputElement>){
        const files = event.target.files ?? [];
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            const reader = new FileReader();
            reader.onload = async (e) => {
                const contents = e.target?.result as string | null // marking as string sinde we call readAsText
                if (contents) {
                    props.uploadDataToDB(file.name, contents)
                }
            }
            reader.readAsText(file)
        }
    }
    return <input type="file" onChange={onChange}/>
}
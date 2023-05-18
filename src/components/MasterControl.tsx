import { Box, Button, Stack, TextField } from "@mui/material";
import { Component, ReactNode } from "react";
import UploadCSV from "./FileUploads/UploadCSV";
import DB, { TableSchemas } from "../lib/sql";
import MessageHistory, { MessageItem } from "./Messaging/MessageHistory";
import SendIcon from '@mui/icons-material/Send';


interface State {
    readyToRender: boolean
    schemas: TableSchemas | null
}

export default class MasterControl extends Component {
    db: DB | null = null
    state: Readonly<State> = {
        readyToRender: false,
        schemas: null,
    };

    async componentDidMount(): Promise<void> {
        this.db = await DB.init([])
        this.setState({ readyToRender: true })
    }

    putCsvIntoDb = (filename: string, csv: string) => {
        this.db?.loadCSV(filename, csv)
        console.log(this.db?.getTableSchemas())
        this.setState({ schemas: this.db?.getTableSchemas() })
    }

    print() {
        console.log(this.db?.convertTableSchemasIntoRoadRunnerAIInput())
    }

    askRoadRunner = async () => {
        const schema = this.db?.convertTableSchemasIntoRoadRunnerAIInput()
    }


    render(): ReactNode {
        if (!this.state.readyToRender) {
            return <></>
        }
        return <Box>
            <UploadCSV uploadDataToDB={this.putCsvIntoDb} />
            <Box>
                <MessageHistory history={testHistory}></MessageHistory>
                <Stack spacing={2}>
                    <TextField label="Outlined" variant="outlined" />
                    <Button variant="contained" endIcon={<SendIcon />} onClick={this.askRoadRunner}>
                        Send
                    </Button>
                </Stack>
            </Box>
        </Box>
    }
}

const testHistory: Array<MessageItem> = [
    { content: "Hello", role: "user" },
    { content: "Hi", role: "assistant" },
    { content: "How are you?", role: "user" },
    { content: "I am a computer. I do not have feelings.", role: "assistant" }
]
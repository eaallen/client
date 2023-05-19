import { Box, Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { Component, ReactNode } from "react";
import UploadCSV from "./FileUploads/UploadCSV";
import DB, { TableSchemas } from "../lib/sql";
import MessageHistory, { MessageItem } from "./Messaging/MessageHistory";
import SendIcon from '@mui/icons-material/Send';
import RoadRunnerAI from "../lib/RoadRunnerAI";
import { QueryExecResult, SqlValue } from "sql.js";


interface State {
    readyToRender: boolean
    schemas: TableSchemas | null
    userInput: string
    history: MessageItem[]
    queryResult: QueryExecResult | null
}

const roadrunner = new RoadRunnerAI()

export default class MasterControl extends Component {
    db: DB | null = null
    state: Readonly<State> = {
        readyToRender: false,
        schemas: null,
        userInput: "",
        history: [],
        queryResult: null,
    };

    async componentDidMount(): Promise<void> {
        this.db = await DB.init([])
        this.setState({ readyToRender: true })
    }

    putCsvIntoDb = (filename: string, csv: string) => {
        this.db?.loadCSV(filename, csv)
        const schemas = this.db?.getCreateSchemas() || ""
        console.log(schemas)
        roadrunner.setSchema(schemas)
        roadrunner.primeChat("")
        this.setState({ schemas: schemas })
    }

    print() {
        console.log(this.db?.convertTableSchemasIntoRoadRunnerAIInput())
    }

    askRoadRunner = async () => {
        roadrunner.userSaid(this.state.userInput)
        this.setState({
            history: roadrunner.history().map(({ content, role }) => ({ content, role })),
            userInput: "",
            queryResult: null,
        })
        await roadrunner.chat()
        this.setState({ history: roadrunner.history().map(({ content, role }) => ({ content, role })) })
        console.log(roadrunner.history())
        // extract code:
        const history = roadrunner.history()
        const roadrunnerResponse = history[history.length - 1].content
        const code = roadrunnerResponse.split("```")[1]
        console.log("code", code)
        // now run the code
        const result = this.db?.exec(code)[0]
        console.log("result",result)
        this.setState({ queryResult: this.db?.exec(code)[0] })

    }


    render(): ReactNode {
        if (!this.state.readyToRender) {
            return <></>
        }
        return <Box>
            <UploadCSV uploadDataToDB={this.putCsvIntoDb} />
            <Box>
                {/* <MessageHistory history={this.state.history}></MessageHistory> */}
                <Stack spacing={2}>
                    <TextField
                        label="Outlined"
                        variant="outlined"
                        value={this.state.userInput}
                        onChange={(e) => this.setState({ userInput: e.target.value })} />
                    <Button variant="contained" endIcon={<SendIcon />} onClick={this.askRoadRunner}>
                        Send
                    </Button>
                </Stack>
            </Box>
            <Box>
                {this.state.queryResult !== null
                    ? <BasicTable header={this.state.queryResult.columns} rows={limit1000rows(this.state.queryResult.values)} />
                    : <></>}

            </Box>
        </Box>
    }
}

function limit1000rows(rows: SqlValue[][]){
    if (rows.length > 1000) {
        return rows.slice(0,1000)
    }
    return rows
}



interface TableProps {
    header: string[]
    rows: SqlValue[][]
}
function BasicTable(props: TableProps) {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        {props.header.map(item => <TableCell key={item}>{item}</TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.rows.map((row, idx) => (
                        <TableRow
                            key={idx}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            {row.map((cell, idx) => <TableCell key={idx} component="th" scope="row">{cell}</TableCell>)}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
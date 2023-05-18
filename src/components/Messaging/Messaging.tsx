import { Box, Button, FormControl, Stack, TextField } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import React from "react";
import MessageHistory, { MessageItem } from "./MessageHistory";

interface Props {
    history: MessageItem[]
}

export default function Messaging(props: Props) {
    return (
        <Box>
            <MessageHistory history={props.history}></MessageHistory>
            <Stack spacing={2}>
                <TextField label="Outlined" variant="outlined" />
                <Button variant="contained" endIcon={<SendIcon />}>
                    Send
                </Button>
            </Stack>
        </Box>
    )
}

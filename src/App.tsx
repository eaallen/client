import { Box } from '@mui/material';
import Messaging from './components/Messaging/Messaging';
import UploadCSV from './components/FileUploads/UploadCSV';

function App() {
  return (
   <Box>
    <UploadCSV/>
    <Messaging></Messaging>
   </Box>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Grid,
} from '@material-ui/core';
const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

const useStyles = makeStyles((theme) => {});

const MediaAdd = ({ open, onClose, showId, directory }) => {
    const classes = useStyles();
    const [mediaPath, setMediaPath] = useState(directory);
    const loaded = React.useRef(false);

    useEffect(() => {
        if (!loaded.current) {
            ipcRenderer.on('media:select', (event, paths) => {
                const directoryPath = JSON.parse(paths)[0];
                setMediaPath(directoryPath);
            });

            loaded.current = true;
        }
    });

    //#region Events

    const handleMediaClick = (event) => {
        ipcRenderer.send('media:click');
    };

    const handleClose = () => {
        onClose();
    };

    const handleSave = (event) => {
        event.preventDefault();

        ipcRenderer.send('series:directory_change', {
            type: 'change',
            id: showId,
            directory_location: mediaPath,
        });

        onClose();
    };
    //#endregion

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth={'md'}>
            <form onSubmit={handleSave}>
                <DialogTitle>Directory</DialogTitle>

                <DialogContent style={{ overflowY: 'visible' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={4}>
                            <Button
                                fullWidth
                                variant="outlined"
                                size="large"
                                onClick={handleMediaClick}
                            >
                                Choose media
                            </Button>
                        </Grid>
                        <Grid item xs={8}>
                            <TextField disabled value={mediaPath} fullWidth />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                    <Button type="submit">Add</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default MediaAdd;

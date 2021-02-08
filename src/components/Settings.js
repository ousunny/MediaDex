import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Tab,
    Tabs,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
} from '@material-ui/core';
import { Delete } from '@material-ui/icons';
const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

const useStyles = makeStyles((theme) => ({
    dialogPaper: {
        height: '80vh',
    },
}));

const Settings = ({ open, onClose }) => {
    const classes = useStyles();
    const [tab, setTab] = React.useState(0);
    const [tags, setTags] = React.useState([]);
    const loaded = React.useRef(false);

    useEffect(() => {
        if (!loaded.current) {
            ipcRenderer.send('tags:load');

            ipcRenderer.on('tags:get', (e, loadedTags) => {
                setTags(JSON.parse(loadedTags));
            });

            loaded.current = true;
        }
    });

    //#region Events

    const handleTabChange = (event, newTab) => {
        setTab(newTab);
    };

    const handleClose = () => {
        onClose();
    };

    const handleTagDelete = (id) => {
        ipcRenderer.send('tags:delete', id);
    };
    //#endregion

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth={'md'}
            classes={{ paper: classes.dialogPaper }}
        >
            <DialogTitle>Settings</DialogTitle>

            <DialogContent>
                <Tabs value={tab} onChange={handleTabChange} centered>
                    <Tab label="Tags" />
                </Tabs>
                <div hidden={tab !== 0}>
                    <Box>
                        <List>
                            {tags.map((tag) => (
                                <ListItem key={tag.id} divider>
                                    <ListItemText primary={tag.tag_name} />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            onClick={() =>
                                                handleTagDelete(tag.id)
                                            }
                                        >
                                            <Delete />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default Settings;

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
    MenuItem,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
const { ipcRenderer } = require('electron');

const useStyles = makeStyles((theme) => ({
    dialogPaper: {
        height: '60vh',
    },
}));

const types = [
    { media: 'series', label: 'Series' },
    { media: 'episode', label: 'Episode' },
    { media: 'movie', label: 'Movie' },
];

const MediaAdd = ({ open, onClose }) => {
    const classes = useStyles();
    const [type, setType] = useState('series');
    const [mediaPath, setMediaPath] = useState('');
    const [tags, setTags] = useState([]);

    useEffect(() => {}, []);

    //#region ipcRenderer
    ipcRenderer.on('media:select', (event, paths) => {
        setMediaPath(JSON.parse(paths)[0]);
    });
    //#endregion

    //#region Events
    const handleTypeChange = (event) => {
        setType(event.target.value);
    };

    const handleMediaClick = (event) => {
        ipcRenderer.send('media:click', type);
    };

    const handleTagDone = (event) => {
        if (event.keyCode === 13 && event.target.value) {
            setTags([...tags, event.target.value]);
            console.log(tags);
        }
    };

    const handleClose = () => {
        onClose();
    };

    const handleSave = () => {};
    //#endregion

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            classes={{ paper: classes.dialogPaper }}
        >
            <DialogTitle>Add Media</DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    {type === 'series' ? (
                        <Grid item xs={9}>
                            <TextField
                                autoFocus
                                fullWidth
                                placeholder="Series Title..."
                            />
                        </Grid>
                    ) : type === 'episode' ? (
                        <React.Fragment>
                            <Grid item xs={7}>
                                <TextField
                                    autoFocus
                                    fullWidth
                                    placeholder="Episode Title..."
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    type="number"
                                    fullWidth
                                    placeholder="#"
                                />
                            </Grid>
                        </React.Fragment>
                    ) : (
                        <Grid item xs={9}>
                            <TextField
                                autoFocus
                                fullWidth
                                placeholder="Movie Title..."
                            />
                        </Grid>
                    )}
                    <Grid item xs={3}>
                        <TextField
                            select
                            fullWidth
                            value={type}
                            onChange={handleTypeChange}
                            helperText="Type of Media"
                        >
                            {types.map((type) => (
                                <MenuItem key={type.media} value={type.media}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={handleMediaClick}
                        >
                            Choose media
                        </Button>
                    </Grid>
                    <Grid item xs={8}>
                        <TextField
                            name="mediaPath"
                            fullWidth
                            placeholder="Path to media..."
                            disabled
                            value={mediaPath}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            options={tags}
                            fullWidth
                            freeSolo
                            onKeyDown={handleTagDone}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="tags"
                                    variant="standard"
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave}>Add</Button>
            </DialogActions>
        </Dialog>
    );
};

export default MediaAdd;

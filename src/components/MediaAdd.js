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
    { value: 'series', label: 'Series' },
    { value: 'episode', label: 'Episode' },
    { value: 'movie', label: 'Movie' },
];

const seasons = [
    { value: 'winter', label: 'Winter' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'fall', label: 'Fall' },
];

const MediaAdd = ({ open, onClose }) => {
    const classes = useStyles();
    const [type, setType] = useState('series');
    const [currentSeason, setCurrentSeason] = useState(1);
    const [airingSeason, setAiringSeason] = useState('winter');
    const [airingYear, setAiringYear] = useState(new Date().getFullYear());
    const [mediaPath, setMediaPath] = useState('');
    const [summary, setSummary] = useState('');
    const [tags, setTags] = useState([]);

    useEffect(() => {
        //#region ipcRenderer
        ipcRenderer.on('media:select', (event, paths) => {
            setMediaPath(JSON.parse(paths)[0]);
        });
        //#endregion
    }, []);

    //#region Events
    const handleTypeChange = (event) => {
        setType(event.target.value);
    };

    const handleCurrentSeasonChange = (event) => {
        setCurrentSeason(event.target.value);
    };

    const handleAiringSeasonChange = (event) => {
        setAiringSeason(event.target.value);
    };

    const handleAiringYearChange = (event) => {
        setAiringYear(event.target.value);
    };

    const handleMediaClick = (event) => {
        ipcRenderer.send('media:click', type);
    };

    const handleSummaryChange = (event) => {
        setSummary(event.target.value);
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
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            type="number"
                            fullWidth
                            value={currentSeason}
                            onChange={handleCurrentSeasonChange}
                            helperText="Current Season"
                        ></TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            select
                            fullWidth
                            value={airingSeason}
                            onChange={handleAiringSeasonChange}
                            helperText="Airing Season"
                        >
                            {seasons.map((season) => (
                                <MenuItem
                                    key={season.value}
                                    value={season.value}
                                >
                                    {season.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            type="number"
                            fullWidth
                            value={airingYear}
                            onChange={handleAiringYearChange}
                            helperText="Airing Year"
                        ></TextField>
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
                        <TextField
                            multiline
                            fullWidth
                            rows={4}
                            value={summary}
                            onChange={handleSummaryChange}
                            helperText="Summary"
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
                                    helperText="Tags"
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

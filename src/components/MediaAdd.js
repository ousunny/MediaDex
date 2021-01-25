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
    FormControl,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
const { ipcRenderer } = require('electron');

const useStyles = makeStyles((theme) => ({
    dialogPaper: {
        height: '80vh',
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
    const [title, setTitle] = useState('');
    const [type, setType] = useState('series');
    const [currentSeason, setCurrentSeason] = useState(1);
    const [airingSeason, setAiringSeason] = useState('winter');
    const [airingYear, setAiringYear] = useState(new Date().getFullYear());
    const [imagePath, setImagePath] = useState('');
    const [mediaPath, setMediaPath] = useState('');
    const [summary, setSummary] = useState('');
    const [tags, setTags] = useState([]);

    useEffect(() => {
        //#region ipcRenderer
        ipcRenderer.on('image:select', (event, paths) => {
            setImagePath(JSON.parse(paths)[0]);
        });

        ipcRenderer.on('media:select', (event, paths) => {
            setMediaPath(JSON.parse(paths)[0]);
        });
        //#endregion
    }, []);

    //#region Events
    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };

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

    const handleImageClick = (event) => {
        ipcRenderer.send('image:click', type);
    };

    const handleMediaClick = (event) => {
        ipcRenderer.send('media:click', type);
    };

    const handleSummaryChange = (event) => {
        setSummary(event.target.value);
    };

    const handleTagDone = (event, options, reason) => {
        setTags(options);
    };

    const handleClose = () => {
        onClose();
    };

    const handleSave = (event) => {
        event.preventDefault();
        const show = {
            title,
            type,
            currentSeason,
            airingSeason,
            airingYear,
            mediaPath,
            summary,
            tags,
        };

        ipcRenderer.send('series:add', {
            ...show,
            current_season: currentSeason,
            airing_season: airingSeason,
            airing_year: airingYear,
        });

        setTitle('');
        setCurrentSeason(1);
        setAiringSeason('winter');
        setAiringYear(new Date().getFullYear());
        setImagePath('');
        setMediaPath('');
        setSummary('');
        setTags([]);

        onClose();
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
            <form onSubmit={handleSave}>
                <DialogTitle>Add Media</DialogTitle>

                <DialogContent style={{ overflowY: 'visible' }}>
                    <Grid container spacing={3}>
                        {type === 'series' ? (
                            <Grid item xs={9}>
                                <TextField
                                    required
                                    autoFocus
                                    fullWidth
                                    value={title}
                                    onChange={handleTitleChange}
                                    placeholder="Title..."
                                    helperText="Series Title (Required)"
                                />
                            </Grid>
                        ) : type === 'episode' ? (
                            <React.Fragment>
                                <Grid item xs={7}>
                                    <TextField
                                        autoFocus
                                        fullWidth
                                        value={title}
                                        onChange={handleTitleChange}
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
                                    value={title}
                                    onChange={handleTitleChange}
                                    placeholder="Title..."
                                    helperText="Movie Title (Required)"
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
                                    <MenuItem
                                        key={type.value}
                                        value={type.value}
                                    >
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                required
                                type="number"
                                fullWidth
                                value={currentSeason}
                                onChange={handleCurrentSeasonChange}
                                helperText="Current Season (Required)"
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
                                required
                                type="number"
                                fullWidth
                                value={airingYear}
                                onChange={handleAiringYearChange}
                                helperText="Airing Year (Required)"
                            ></TextField>
                        </Grid>
                        <Grid item xs={4}>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={handleImageClick}
                            >
                                Choose image for series
                            </Button>
                        </Grid>
                        <Grid item xs={8}>
                            <TextField
                                name="imagePath"
                                fullWidth
                                placeholder="Path to image..."
                                disabled
                                value={imagePath}
                            />
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
                                onChange={handleTagDone}
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
                    <Button onClick={handleClose}>Close</Button>
                    <Button type="submit">Add</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default MediaAdd;

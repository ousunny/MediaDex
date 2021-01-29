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
    Typography,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

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

const MediaEdit = ({ open, onClose, seriesUpdated, show }) => {
    const classes = useStyles();
    const [title, setTitle] = useState(show.title);
    const [type, setType] = useState('series');
    const [currentSeason, setCurrentSeason] = useState(
        show.series_seasons[0].current_season
    );
    const [airingSeason, setAiringSeason] = useState(show.airing_season);
    const [airingYear, setAiringYear] = useState(show.airing_year);
    const [imagePath, setImagePath] = useState(
        show.series_seasons[0].image_location
    );
    const [mediaPath, setMediaPath] = useState(
        show.series_seasons[0].directory_location
    );
    const [summary, setSummary] = useState(show.series_seasons[0].summary);
    const [tags, setTags] = useState(
        show.series_tags.map((series_tag) => series_tag.tag.tag_name)
    );
    const loaded = React.useRef(false);

    useEffect(() => {
        if (!loaded.current) {
            //#region ipcRenderer
            ipcRenderer.on('image:select', (event, paths) => {
                setImagePath(JSON.parse(paths)[0]);
            });

            //#endregion
            loaded.current = true;
        }
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

        const updateShow = {
            id: show.id,
            title,
            type,

            image_location: imagePath,
            current_season: currentSeason,
            airing_season: airingSeason,
            airing_year: airingYear,
            summary,
            tags,
        };

        ipcRenderer.send('series:edit', updateShow);
        seriesUpdated(show.id);

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
                                fullWidth
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
                                value={tags}
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
                    <Button type="submit">Save</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default MediaEdit;

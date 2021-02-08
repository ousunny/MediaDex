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

const exts = ['.mkv', '.mp4'];

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
    const [currentSeason, setCurrentSeason] = useState(1);
    const [airingSeason, setAiringSeason] = useState('winter');
    const [airingYear, setAiringYear] = useState(new Date().getFullYear());
    const [imagePath, setImagePath] = useState('');
    const [mediaPath, setMediaPath] = useState('');
    const [summary, setSummary] = useState('');
    const [tags, setTags] = useState([]);
    const [episodes, setEpisodes] = useState([]);
    const loaded = React.useRef(false);

    useEffect(() => {
        if (!loaded.current) {
            //#region ipcRenderer
            ipcRenderer.on('image:select', (event, paths) => {
                setImagePath(JSON.parse(paths)[0]);
            });

            ipcRenderer.on('media:select', (event, paths) => {
                if (JSON.parse(paths).length > 0) {
                    const directoryPath = JSON.parse(paths)[0];
                    setMediaPath(directoryPath);

                    fs.readdir(directoryPath, (err, filenames) => {
                        const filteredEpisodes = filenames.reduce(
                            (results, filename, index) => {
                                if (exts.indexOf(path.extname(filename)) >= 0) {
                                    const episodeNumber = parseInt(
                                        filename
                                            .split(' - ')[1]
                                            .match(/[0-9]+/)[0]
                                    );

                                    results.push({
                                        index,
                                        filePath: path.join(
                                            directoryPath,
                                            filename
                                        ),
                                        filename,
                                        episodeNumber,
                                    });
                                }

                                return results;
                            },
                            []
                        );

                        setEpisodes(filteredEpisodes);
                    });
                }
            });
            //#endregion
            loaded.current = true;
        }
    }, []);

    //#region Events
    const handleTitleChange = (event) => {
        setTitle(event.target.value);
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
        ipcRenderer.send('image:click');
    };

    const handleMediaClick = (event) => {
        ipcRenderer.send('media:click');
    };

    const handleSummaryChange = (event) => {
        setSummary(event.target.value);
    };

    const handleTagDone = (event, options, reason) => {
        setTags(options);
    };

    const handleEpisodeChange = (event, index) => {
        const currentEpisodes = [...episodes];

        const episodeIndex = currentEpisodes.findIndex(
            (currentEpisode) => currentEpisode.index === index
        );
        currentEpisodes[episodeIndex] = {
            ...currentEpisodes[episodeIndex],
            episodeNumber: event.target.value,
        };

        setEpisodes(currentEpisodes);
    };

    const handleClose = () => {
        setTitle('');
        setCurrentSeason(1);
        setAiringSeason('winter');
        setAiringYear(new Date().getFullYear());
        setImagePath('');
        setMediaPath('');
        setSummary('');
        setTags([]);
        setEpisodes([]);

        onClose();
    };

    const handleSave = (event) => {
        event.preventDefault();

        const show = {
            title,
            currentSeason,
            airingSeason,
            airingYear,
            mediaPath,
            summary,
            tags,
            episodes,
        };

        ipcRenderer.send('series:add', {
            ...show,
            directory_location: mediaPath,
            image_location: imagePath,
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
        setEpisodes([]);

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
                        <Grid item xs={3}>
                            <TextField
                                required
                                type="number"
                                fullWidth
                                value={currentSeason}
                                onChange={handleCurrentSeasonChange}
                                helperText="Current Season (Required)"
                            ></TextField>
                        </Grid>
                        <Grid item xs={6}>
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
                        <Grid item xs={6}>
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
                                value={imagePath || ''}
                            />
                        </Grid>
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
                            <TextField
                                name="mediaPath"
                                fullWidth
                                placeholder="Path to media..."
                                disabled
                                value={mediaPath || ''}
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

                        {episodes.length > 0 && (
                            <Grid container item spacing={3}>
                                <Grid item>
                                    <Typography variant="h6">
                                        Episodes
                                    </Typography>
                                </Grid>

                                {episodes.length > 0 &&
                                    episodes.map((episode) => (
                                        <Grid
                                            container
                                            item
                                            xs={12}
                                            key={episode.index}
                                            spacing={1}
                                        >
                                            <Grid item xs={11}>
                                                <TextField
                                                    disabled
                                                    fullWidth
                                                    value={episode.filename}
                                                />
                                            </Grid>
                                            <Grid item xs={1}>
                                                <TextField
                                                    fullWidth
                                                    value={
                                                        episode.episodeNumber
                                                    }
                                                    onChange={(event) =>
                                                        handleEpisodeChange(
                                                            event,
                                                            episode.index
                                                        )
                                                    }
                                                />
                                            </Grid>
                                        </Grid>
                                    ))}
                            </Grid>
                        )}
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

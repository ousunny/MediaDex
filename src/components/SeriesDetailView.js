import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Button,
    Grid,
    Typography,
    InputBase,
    Chip,
    List,
    ListItem,
    ListItemText,
} from '@material-ui/core';
const { ipcRenderer } = require('electron');
const path = require('path');

const useStyles = makeStyles((theme) => ({
    root: {
        margin: '0 0 2rem 0',
    },
    img: {
        width: '100%',
        height: '350px',
        objectFit: 'cover',
        objectPosition: 'center',
    },
    tags: {
        margin: '0.5rem -0.2rem',
    },
    tag: {
        margin: '0 0.5rem 0 0',
    },
    episodes: {
        width: '100%',
    },
}));

const SeriesDetailView = ({ show }) => {
    const classes = useStyles();

    const handleEpisodeClick = (filePath) => {
        ipcRenderer.send('episode:play', filePath);
    };

    return (
        <Fragment>
            <Grid container spacing={3}>
                <Grid container item spacing={3}>
                    <Grid item xs={3}>
                        <img
                            className={classes.img}
                            src={path.join(
                                'file://',
                                show.series_seasons[0].image_location
                            )}
                        />
                    </Grid>
                    <Grid
                        container
                        item
                        direction="column"
                        justify="space-between"
                        xs={9}
                        spacing={3}
                    >
                        <Grid container item direction="column">
                            <Typography variant="h3">{show.title}</Typography>
                            <Typography variant="h6">{`Season ${show.series_seasons[0].current_season}`}</Typography>
                            <Grid container item className={classes.tags}>
                                {show.series_tags.map((series_tag) => (
                                    <Chip
                                        key={series_tag.tag.id}
                                        className={classes.tag}
                                        label={series_tag.tag.tag_name}
                                    />
                                ))}
                            </Grid>
                        </Grid>
                        <Grid item>
                            <InputBase
                                multiline
                                disabled
                                fullWidth
                                style={{ color: 'white' }}
                                value={show.series_seasons[0].summary}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid container item>
                    <Typography variant="h5">{`Episodes (${show.episodes.length})`}</Typography>
                    <List className={classes.episodes}>
                        {show.episodes.map((episode) => (
                            <ListItem
                                key={episode.id}
                                button
                                divider
                                onClick={() =>
                                    handleEpisodeClick(episode.location)
                                }
                            >
                                <ListItemText
                                    primary={`Episode ${episode.number}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Grid>
            </Grid>
        </Fragment>
    );
};

export default SeriesDetailView;

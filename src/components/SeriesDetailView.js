import React, { Fragment, useState, useEffect } from 'react';
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
import {
    Delete,
    Edit,
    Link,
    Refresh,
    Bookmark,
    BookmarkBorder,
} from '@material-ui/icons';
const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
import MediaEdit from './MediaEdit';
import DirectoryDialog from './DirectoryDialog';

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
    icon: {
        marginTop: '0.5rem',
    },
}));

const SeriesDetailView = ({ displayDetailView, seriesUpdated, show }) => {
    const classes = useStyles();
    const [editOpen, setEditOpen] = useState(false);
    const [directoryChangeOpen, setDirectoryChangeOpen] = useState(false);

    const handleDeleteClick = () => {
        ipcRenderer.send('media:delete', show.id);
        displayDetailView(false, null);
    };

    const handleBookmarkClick = () => {
        ipcRenderer.send('series:bookmark', {
            seriesId: show.id,
            favorite: show.series_seasons[0].favorite,
        });

        seriesUpdated(show.id);
    };

    const handleEpisodeClick = (episode) => {
        ipcRenderer.send('episode:play', episode);
    };

    const handleEditClick = () => {
        editOpen ? setEditOpen(false) : setEditOpen(true);
    };

    const handleRefreshClick = () => {
        ipcRenderer.send('series:directory_change', {
            type: 'refresh',
            id: show.id,
            directory_location: show.series_seasons[0].directory_location,
        });

        seriesUpdated(show.id);
    };

    const handleDirectoryChangeClick = () => {
        directoryChangeOpen
            ? setDirectoryChangeOpen(false)
            : setDirectoryChangeOpen(true);
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
                    >
                        <Grid container item direction="column">
                            <Grid
                                container
                                item
                                justify="space-between"
                                alignItems="flex-start"
                            >
                                <Grid
                                    container
                                    item
                                    xs={10}
                                    wrap="nowrap"
                                    alignItems="flex-start"
                                >
                                    <Typography
                                        variant="h3"
                                        style={{ marginRight: '0.5rem' }}
                                    >
                                        {show.title}
                                    </Typography>
                                    <Button onClick={handleBookmarkClick}>
                                        {show.series_seasons[0].favorite ? (
                                            <Bookmark
                                                style={{
                                                    fontSize: '2.5rem',
                                                    color: 'red',
                                                }}
                                            />
                                        ) : (
                                            <BookmarkBorder
                                                style={{
                                                    fontSize: '2.5rem',
                                                }}
                                            />
                                        )}
                                    </Button>
                                </Grid>
                                <Grid
                                    container
                                    item
                                    xs={2}
                                    className={classes.icon}
                                    justify="flex-end"
                                >
                                    <Button onClick={handleEditClick}>
                                        <Edit />
                                    </Button>
                                    <Button onClick={handleDeleteClick}>
                                        <Delete color="error" />
                                    </Button>
                                </Grid>
                            </Grid>

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
                    <Grid item xs={10}>
                        <Typography variant="h5">{`Episodes (${show.episodes.length})`}</Typography>
                    </Grid>
                    <Grid container item xs={2} justify="flex-end">
                        <Button onClick={handleRefreshClick}>
                            <Refresh />
                        </Button>
                        <Button onClick={handleDirectoryChangeClick}>
                            <Link />
                        </Button>
                    </Grid>
                    <List className={classes.episodes}>
                        {show.episodes.map((episode) => (
                            <ListItem
                                key={episode.id}
                                button
                                divider
                                onClick={() =>
                                    handleEpisodeClick({
                                        seriesId: show.id,
                                        location: episode.location,
                                    })
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

            <DirectoryDialog
                open={directoryChangeOpen}
                onClose={handleDirectoryChangeClick}
                seriesUpdated={seriesUpdated}
                showId={show.id}
                directory={show.series_seasons[0].directory_location}
            />

            <MediaEdit
                open={editOpen}
                onClose={handleEditClick}
                seriesUpdated={seriesUpdated}
                show={show}
            />
        </Fragment>
    );
};

export default SeriesDetailView;

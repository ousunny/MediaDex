import React, { Fragment, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Grid, Fade, Grow } from '@material-ui/core';
import SeriesItem from './SeriesItem';
import { ipcRenderer } from 'electron';

const useStyles = makeStyles((theme) => ({}));

const Home = ({ displayDetailView, seriesRecent, seriesLatest }) => {
    const classes = useStyles();
    const loaded = React.useRef(false);

    useEffect(() => {
        if (!loaded.current) {
            ipcRenderer.send('series:load_recent', 4);
            ipcRenderer.send('series:load_latest', 4);

            loaded.current = true;
        }
    }, []);

    return (
        <Fragment>
            {seriesRecent.length !== 0 && (
                <Fragment>
                    <Typography variant="h3">Recent</Typography>
                    <Grid container spacing={5}>
                        {seriesRecent.map((show, index) => (
                            <Grid item xs={3} key={show.id}>
                                <Grow in={true} timeout={200 * (index + 1)}>
                                    <div>
                                        <SeriesItem
                                            displayDetailView={
                                                displayDetailView
                                            }
                                            show={show}
                                        />
                                    </div>
                                </Grow>
                            </Grid>
                        ))}
                    </Grid>
                </Fragment>
            )}

            <Typography variant="h3">Latest</Typography>
            <Grid container spacing={5}>
                {seriesLatest.map((show, index) => (
                    <Grid item xs={3} key={show.id}>
                        <Grow in={true} timeout={200 * (index + 1)}>
                            <div>
                                <SeriesItem
                                    displayDetailView={displayDetailView}
                                    show={show}
                                />
                            </div>
                        </Grow>
                    </Grid>
                ))}
            </Grid>
        </Fragment>
    );
};

export default Home;

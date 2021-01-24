import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Grid, Fade, Grow } from '@material-ui/core';
import SeriesItem from './SeriesItem';

const useStyles = makeStyles((theme) => ({}));

const Home = ({ displayDetailView, series, seriesLatest }) => {
    const classes = useStyles();

    return (
        <Fragment>
            {series.length !== 0 && (
                <Fragment>
                    <Typography variant="h3">Recent</Typography>
                    <Grid container spacing={5}>
                        {series.map((show, index) => (
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

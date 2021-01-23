import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Grid } from '@material-ui/core';
import SeriesItem from './SeriesItem';

const useStyles = makeStyles((theme) => ({}));

const Home = ({ displayDetailView, series }) => {
    const classes = useStyles();

    return (
        <Fragment>
            <Typography variant="h3">Recent</Typography>
            <Grid container spacing={5}>
                {series.map((show) => (
                    <Grid item xs={3} key={show.id}>
                        <SeriesItem
                            displayDetailView={displayDetailView}
                            show={show}
                        />
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h3">Latest</Typography>
        </Fragment>
    );
};

export default Home;

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import SeriesItem from './SeriesItem';

const useStyles = makeStyles((theme) => ({}));

const Home = ({ series }) => {
    const classes = useStyles();

    return (
        <div>
            <Typography variant="h3">Recent</Typography>
            {series.map((show) => (
                <SeriesItem key={show.id} show={show} />
            ))}

            <Typography variant="h3">Latest</Typography>
        </div>
    );
};

export default Home;

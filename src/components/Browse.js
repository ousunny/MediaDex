import React, { Fragment, useEffect } from 'react';
import { Grid, Button, Typography, Grow } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { ipcRenderer } from 'electron';
import SeriesItem from './SeriesItem';

const useStyles = makeStyles((theme) => ({
    selected: {
        backgroundColor: '#f2f2f2',
        color: '#111',
    },
}));

const Browse = ({ displayDetailView, seriesBrowse }) => {
    const classes = useStyles();
    const [series, setSeries] = React.useState([]);
    const [selectedLetter, setSelectedLetter] = React.useState('');
    const [alphabet, setAlphabet] = React.useState([]);
    const loaded = React.useRef(false);

    useEffect(() => {
        if (!loaded.current) {
            setAlphabet(generateAlphabet('A', 'Z'));

            ipcRenderer.send('series:browse', 'ALL');

            loaded.current = true;
        }
    }, []);

    const generateAlphabet = (start, end) => {
        let alphabetArray = ['ALL'];
        for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i++) {
            alphabetArray.push(String.fromCharCode(i));
        }

        return alphabetArray;
    };

    const handleLetterClick = (letter) => {
        setSelectedLetter(letter);

        ipcRenderer.send('series:browse', letter);
    };

    return (
        <Fragment>
            <Grid container>
                <Grid container item xs={12}>
                    {alphabet.map((letter) => (
                        <Button
                            key={letter}
                            onClick={() => handleLetterClick(letter)}
                            className={clsx({
                                [classes.selected]: letter === selectedLetter,
                            })}
                        >
                            <Typography variant="button">{letter}</Typography>
                        </Button>
                    ))}
                </Grid>
                <Grid container item xs={12} spacing={3}>
                    {seriesBrowse.map((show, index) => (
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
            </Grid>
        </Fragment>
    );
};

export default Browse;

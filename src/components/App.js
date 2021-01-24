import React, { Fragment, useState, useEffect } from 'react';
import {
    makeStyles,
    ThemeProvider,
    createMuiTheme,
} from '@material-ui/core/styles';
import {
    Button,
    CssBaseline,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemText,
} from '@material-ui/core';
import { Add } from '@material-ui/icons';
import SearchBar from './SearchBar';
import Home from './Home';
import Bookmarks from './Bookmarks';
import Browse from './Browse';
import MediaAdd from './MediaAdd';
import SeriesDetailView from './SeriesDetailView';
import { ipcRenderer } from 'electron';

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
});

const drawerWidth = '240px';
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        textAlign: 'center',
    },
    drawerPaper: {
        width: drawerWidth,
    },
    logo: {
        fontSize: '3rem',
        margin: '1rem',
    },
    nav: {
        margin: 'auto',
        width: '100%',
    },
    navItems: {
        padding: '0 1rem',
        fontSize: '2rem',
        textAlign: 'right',
    },
    content: {
        padding: theme.spacing(3),
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    actions: {
        margin: '1rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    searchBar: {
        width: '80%',
    },
    add: {
        padding: '1rem',
        height: '100%',
        position: 'absolute',
        right: 0,
    },
}));

const App = () => {
    const classes = useStyles();
    const [series, setSeries] = useState([]);
    const [seriesLatest, setSeriesLatest] = useState([]);
    const [nav, setNav] = useState(0);
    const [addOpen, setAddOpen] = useState(false);
    const [detailView, setDetailView] = useState(false);

    useEffect(() => {
        ipcRenderer.send('series:load_home');

        ipcRenderer.on('series:get', (e, series) => {
            setSeries(JSON.parse(series));
            console.log(series);
        });
        ipcRenderer.on('series:get_latest', (e, series) => {
            setSeriesLatest(JSON.parse(series));
            console.log(series);
        });
    }, []);

    const handleNavClick = (index) => {
        setDetailView(false);
        setNav(index);
    };

    const handleAddClick = () => {
        addOpen ? setAddOpen(false) : setAddOpen(true);
    };

    function displayDetailView(display) {
        setDetailView(true);
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Drawer
                className={classes.drawer}
                variant="permanent"
                anchor="left"
                classes={{ paper: classes.drawerPaper }}
            >
                <Typography className={classes.logo} variant="h1">
                    MediaDex
                </Typography>
                <List className={classes.nav}>
                    {['Home', 'Bookmarks', 'Browse'].map((text, index) => (
                        <ListItem
                            button
                            key={text}
                            value={index}
                            selected={index === nav ? true : false}
                            onClick={() => handleNavClick(index)}
                        >
                            <ListItemText
                                classes={{ primary: classes.navItems }}
                                primary={text}
                            />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <main className={classes.content}>
                {!detailView ? (
                    <Fragment>
                        <div className={classes.actions}>
                            <div className={classes.searchBar}>
                                <SearchBar />
                            </div>

                            <Button
                                className={classes.add}
                                onClick={handleAddClick}
                            >
                                <Add />
                            </Button>
                        </div>

                        {nav === 0 ? (
                            <Home
                                series={series}
                                seriesLatest={seriesLatest}
                                displayDetailView={displayDetailView}
                            />
                        ) : nav === 1 ? (
                            <Bookmarks series={series} />
                        ) : (
                            <Browse series={series} />
                        )}
                    </Fragment>
                ) : (
                    <Fragment>
                        <SeriesDetailView />
                    </Fragment>
                )}
            </main>

            <MediaAdd open={addOpen} onClose={handleAddClick} />
        </ThemeProvider>
    );
};

export default App;

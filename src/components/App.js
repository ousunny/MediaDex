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
    ListItemIcon,
    ListItemText,
} from '@material-ui/core';
import {
    Add,
    Home as HomeIcon,
    Bookmark,
    VideoLibrary,
    ArrowBack,
} from '@material-ui/icons';
import SearchBar from './SearchBar';
import Home from './Home';
import Bookmarks from './Bookmarks';
import Browse from './Browse';
import MediaAdd from './MediaAdd';
import SeriesDetailView from './SeriesDetailView';
import clsx from 'clsx';
import { ipcRenderer } from 'electron';

const navigationItems = [
    {
        label: 'Home',
        icon: <HomeIcon fontSize="large" />,
    },
    { label: 'Bookmarks', icon: <Bookmark fontSize="large" /> },
    { label: 'Browse', icon: <VideoLibrary fontSize="large" /> },
];

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
});

const drawerWidth = '240px';
const drawerShrinkWidth = '100px';
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
    drawerExpand: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerShrink: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: drawerShrinkWidth,
    },
    logo: {
        fontSize: '3rem',
        margin: '1rem',
    },
    nav: {
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    navText: {
        fontSize: '1.8rem',
        textAlign: 'right',
    },
    navIcon: {
        padding: '0.5rem',
    },
    navIconShrink: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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
    back: {
        padding: '1rem',
        height: '100%',
    },
}));

const App = () => {
    const classes = useStyles();
    const [series, setSeries] = useState([]);
    const [seriesLatest, setSeriesLatest] = useState([]);
    const [nav, setNav] = useState(0);
    const [addOpen, setAddOpen] = useState(false);
    const [detailView, setDetailView] = useState(false);
    const [detailShow, setDetailShow] = useState(null);
    const [currentShowId, setCurrentShowId] = useState(-1);
    const loaded = React.useRef(false);

    useEffect(() => {
        if (!loaded.current) {
            ipcRenderer.send('series:load', nav);

            ipcRenderer.on('series:get', (e, loadedShows) => {
                setSeries(JSON.parse(loadedShows));
            });

            ipcRenderer.on('series:get_latest', (e, series) => {
                setSeriesLatest(JSON.parse(series));
                console.log(series);
            });

            loaded.current = true;
        }

        if (detailView) {
            const currentShowIndex = series.findIndex(
                (show) => show.id === currentShowId
            );
            currentShowIndex >= 0 && setDetailShow(series[currentShowIndex]);
        }
    }, [series]);

    const handleBackClick = () => {
        setDetailView(false);
    };

    const handleNavClick = (index) => {
        setDetailView(false);
        ipcRenderer.send('series:load', index);
        setNav(index);
    };

    const handleAddClick = () => {
        addOpen ? setAddOpen(false) : setAddOpen(true);
    };

    function displayDetailView(display, show) {
        setDetailView(display);
        setDetailShow(show);
    }

    function seriesUpdated(id) {
        setCurrentShowId(id);
        // const currentShowIndex = series.findIndex((show) => show.id === id);
        // currentShowIndex >= 0 && setDetailShow(series[currentShowIndex]);
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Drawer
                className={clsx(classes.drawer, {
                    [classes.drawerExpand]: !detailView,
                    [classes.drawerShrink]: detailView,
                })}
                variant="permanent"
                anchor="left"
                classes={{
                    paper: clsx(classes.drawerPaper, {
                        [classes.drawerExpand]: !detailView,
                        [classes.drawerShrink]: detailView,
                    }),
                }}
            >
                <Typography className={classes.logo} variant="h1">
                    {!detailView ? (
                        'MediaDex'
                    ) : (
                        <Button
                            className={classes.back}
                            onClick={handleBackClick}
                        >
                            <ArrowBack fontSize="large" />
                        </Button>
                    )}
                </Typography>
                <List className={classes.nav}>
                    {navigationItems.map((navigationItem, index) => (
                        <ListItem
                            button
                            key={navigationItem.label}
                            value={index}
                            selected={index === nav ? true : false}
                            onClick={() => handleNavClick(index)}
                        >
                            {!detailView && (
                                <ListItemText
                                    classes={{ primary: classes.navText }}
                                    primary={navigationItem.label}
                                />
                            )}
                            <ListItemIcon
                                className={clsx(classes.navIcon, {
                                    [classes.navIconShrink]: detailView,
                                })}
                            >
                                {navigationItem.icon}
                            </ListItemIcon>
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
                        <SeriesDetailView
                            displayDetailView={displayDetailView}
                            seriesUpdated={seriesUpdated}
                            show={detailShow}
                        />
                    </Fragment>
                )}
            </main>

            <MediaAdd open={addOpen} onClose={handleAddClick} />
        </ThemeProvider>
    );
};

export default App;

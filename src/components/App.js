import React from 'react';
import {
    makeStyles,
    ThemeProvider,
    createMuiTheme,
} from '@material-ui/core/styles';
import {
    CssBaseline,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemText,
} from '@material-ui/core';
import SearchBar from './SearchBar';

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
        justifyContent: 'center',
    },
}));

const App = () => {
    const classes = useStyles();

    return (
        <ThemeProvider className={classes.root} theme={darkTheme}>
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
                        <ListItem button key={text}>
                            <ListItemText
                                classes={{ primary: classes.navItems }}
                                primary={text}
                            />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <main className={classes.content}>
                <SearchBar />
            </main>
        </ThemeProvider>
    );
};

export default App;

import { useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(() => createStyles({}));

export const Search = () => {
  const styles = useStyles();
  return (
    <div>
      <TextField
        id="outlined-full-width"
        label="Label"
        style={{ margin: 8 }}
        placeholder="Placeholder"
        helperText="Full width!"
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
        variant="outlined"
      />
    </div>
  );
};

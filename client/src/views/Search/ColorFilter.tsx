import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ChangeType } from 'views/Search/FilterPanel';
import { tuple } from 'core/types';
import { memo } from 'react';

interface ColorOption {
  id: string;
  value: string;
  background?: string;
  icon?: string;
}

interface Props {
  param: string;
  selected: string;
  colors: ColorOption[];
  onChange: (type: ChangeType, param: string, value: string) => void;
}

const colorStyle = ({ value, background }: ColorOption) => ({
  background: value,

  '& > div': {
    background: background ?? value,
  },
});

const selectedColorStyle = (_: ColorOption) => ({
  '& > div': {
    visibility: 'visible',
  },
});

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    color: {
      position: 'relative',
      margin: '4px',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',

      '&:hover': {
        '& > div': {
          visibility: 'visible',
        },
      },
    },
    background: {
      position: 'absolute',
      width: '32px',
      height: '32px',
      borderRadius: '4px',
      visibility: 'hidden',
      zIndex: -1,
      filter: 'opacity(38%)',
    },
    colors: (colors: ColorOption[]) => {
      const result = Object.fromEntries(
        colors
          .map(option => [
            tuple(`&.${option.id}`, colorStyle(option)),
            tuple(`&.${option.id}-selected`, selectedColorStyle(option)),
          ])
          .flat(1)
      );

      return result;
    },
  })
);

export const ColorFilter = memo((props: Props) => {
  const classes = useStyles(props.colors ?? []);
  const { param, colors, selected, onChange } = props;

  const handleSelect = (id: string) => {
    if (id === selected) return;

    const type: ChangeType = id === 'default' ? 'remove' : 'update';
    onChange(type, param, id);
  };

  return (
    <div className={classes.container}>
      {colors.map(({ id, icon }) => (
        <div
          key={id}
          className={classNames(
            classes.color,
            classes.colors,
            id,
            id === selected && `${id}-selected`
          )}
          onClick={() => handleSelect(id)}
        >
          {icon && <FontAwesomeIcon icon={icon as any} />}
          <div className={classes.background} />
        </div>
      ))}
    </div>
  );
});

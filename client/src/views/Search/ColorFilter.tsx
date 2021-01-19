import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SearchService from 'core/SearchService';
import { tuple } from 'core/types';

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

export const ColorFilter = (props: Props) => {
  const history = useHistory();
  const classes = useStyles(props.colors ?? []);
  const { param, colors, selected } = props;

  const handleSelect = (id: string) => {
    if (id === selected) return;

    const {
      location: { pathname, search },
    } = history;
    const url = pathname + search;

    let updated: string;
    if (id === 'default') {
      updated = SearchService.removeParam(url, param);
    } else {
      updated = SearchService.updateParam(url, param, id);
    }

    history.replace(updated);
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
};

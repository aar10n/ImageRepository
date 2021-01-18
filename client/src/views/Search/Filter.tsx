import { createStyles, makeStyles } from '@material-ui/core/styles';
import { create } from 'domain';

interface FilterOption {
  name: string;
  value: any;
}

interface BlockProps {
  options: FilterOption[];
}

interface ColorProps {}

interface NumberProps {}

interface BaseProps {
  selected: any;
}

interface FilterType {
  block: BlockProps;
  color: ColorProps;
  number: NumberProps;
}

// interface Props {
//   type: FilterType;
//   options: FilterOption[];
//   selected: any;
// }

type Props<T extends FilterType> = BaseProps;

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
    },

    /* block filter */
    block: {
      backgroundColor: '#f3f4f5',
    },

    /* color filter */

    /* number filter */
  })
);

// export const Filter = (props: Props) => {
//   const classes = useStyles();
//   const { type, options, selected } = props;

//   const BlockFilter = () => {

//   }

//   const ColorFilter = () => {

//   }

// };

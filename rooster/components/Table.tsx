//very simple table abstraction

export function Table({ header, body, classes = '' }) {
  return (
    <table className={'table-fixed font-semibold mr-12 text-center ' + classes}>
      <thead>
        <tr className="border-b h-10">{header}</tr>
      </thead>
      <tbody>{body}</tbody>
    </table>
  );
}

export function TableRow({ children, index, onClick = null }) {
  return (
    <tr
      onClick={onClick ? onClick : () => {}}
      className={`${
        index % 2 ? 'bg-neutral-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
      } hover:text-gray-400 dark:hover:text-gray-300 mt-1.5 mb-1.5 h-12 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {children}
    </tr>
  );
}

export const firstCellHeader = 'text-left pl-4 rounded-tl-2xl';

export const lastCellHeader = 'rounded-tr-2xl';

export const firstCellBody = 'text-left rounded-l-xl pl-4';

export const lastCellBody = 'rounded-r-xl';

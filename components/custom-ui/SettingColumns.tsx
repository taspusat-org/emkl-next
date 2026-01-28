import { Button } from '../ui/button';
import { useTheme } from 'next-themes';
import 'react-nestable/dist/styles/index.css';
import { IoSettingsSharp } from 'react-icons/io5';
import { Checkbox } from '@/components/ui/checkbox';
import { PopoverAnchor } from '@radix-ui/react-popover';
import React, { useEffect, useRef, useState } from 'react';
import { resetGridConfig, saveGridConfig } from '@/lib/utils';
import Nestable, { Item as NestableItem } from 'react-nestable';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface SettingColumnsProps {
  defaultColumns: any;
  saveColumns: any;
  userId: any;
  gridName: string;
  setColumnsOrder: React.Dispatch<React.SetStateAction<readonly number[]>>;
  setColumnsWidth: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >;
  onReset: () => void;
  // isOpen?: boolean;
  // contextMenu?:any;
}

type Item = NestableItem & {
  amount?: number;
};

const styles: React.CSSProperties = {
  position: 'relative',
  // background: 'WhiteSmoke',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer', // Makes the entire element draggable
  fontWeight: '700'
};

const cssCenter: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default function SettingColumns({
  defaultColumns,
  saveColumns,
  userId,
  gridName,
  setColumnsOrder,
  setColumnsWidth,
  onReset
}: SettingColumnsProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === 'dark' || resolvedTheme === 'dark';
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [itemDraggable, setItemDraggable] = useState<Item[]>([]);
  const [itemNotDraggable, setItemNotDraggable] = useState<Item[]>([]);
  const [popoverWidth, setPopoverWidth] = useState<number | string>('auto');
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleRowSelect = (rowKey: number) => {
    setCheckedRows((prev) => {
      const updated = new Set(prev);
      if (updated.has(rowKey)) {
        updated.delete(rowKey);
      } else {
        updated.add(rowKey);
      }

      return updated;
    });
  };

  const stopAutoScroll = () => {
    window.removeEventListener('mousemove', handleDragMouseMove);
  };

  const applyDynamicTransformFix = () => {
    // 1. Ambil wrapper popover Radix (yang punya transform translate)
    const popperWrapper = document.querySelector(
      '[data-radix-popper-content-wrapper]'
    ) as HTMLElement;

    // 2. Ambil drag-layer react-nestable (selalu di body)
    const dragLayer = document.querySelector(
      '.nestable-drag-layer'
    ) as HTMLElement;

    if (!popperWrapper || !dragLayer) return;

    // 3. Ambil nilai transform popover (biasanya matrix)
    const transform = window.getComputedStyle(popperWrapper).transform;

    if (transform === 'none') return;

    // 4. Parse matrix -> ambil translateX dan translateY
    const values = transform.match(/matrix.*\((.+)\)/);

    if (!values) return;

    const parts = values[1].split(', ');
    const translateX = parseFloat(parts[4]);
    const translateY = parseFloat(parts[5]);

    // 5. Pasang kompensasi ke drag-layer
    dragLayer.style.transform = `translate(${-translateX}px, ${-translateY}px)`;
  };

  const handleDragMouseMove = (e: MouseEvent) => {
    const container = scrollRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const threshold = 40; // jarak trigger scroll
    const speed = 10;

    if (e.clientY < rect.top + threshold) {
      container.scrollTop -= speed; // scroll up
    } else if (e.clientY > rect.bottom - threshold) {
      container.scrollTop += speed; // scroll down
    }
  };

  const renderItem = (props: {
    item: Item;
    handler?: React.ReactNode;
  }): JSX.Element => {
    const { item, handler } = props;

    return (
      <div
        className="w-full bg-background"
        style={{
          ...styles
        }}
      >
        <div className="w-8" style={{ ...cssCenter }}>
          {handler}
        </div>

        <div className="w-8 gap-2" style={{ ...cssCenter, width: '3rem' }}>
          <Checkbox
            checked={checkedRows.has(item.key)}
            onCheckedChange={() => handleRowSelect(item.key)}
            id={`row-checkbox-${item.key}`}
          />
          <p className="w-5 text-right">{item.order}.</p>
        </div>

        <div className={`flex-1 p-2 text-sm`}>
          {item.name ? item.name : 'CHECK BOX'}
        </div>
      </div>
    );
  };

  const renderItemNotDraggable = () => {
    return (
      <>
        {itemNotDraggable.map((item) => (
          <div className="mt-3 w-full bg-background" style={{ ...styles }}>
            <div
              className="ml-8 w-8 gap-2"
              style={{ ...cssCenter, width: '3rem' }}
            >
              <Checkbox
                checked={checkedRows.has(item.key)}
                onCheckedChange={() => handleRowSelect(item.key)}
                id={`row-checkbox-${item.key}`}
              />
              <p className="w-5 text-right">{item.order}.</p>
            </div>

            <div className="flex-1 p-2 text-sm text-black">
              {item.name ? item.name : 'CHECK BOX'}
            </div>
          </div>
        ))}
      </>
    );
  };

  const handleChange = (options: {
    items: Item[];
    dragItem: Item;
    targetPath: number[];
  }) => {
    setItemDraggable(options.items); // Update items
  };

  const handleSave = () => {
    const columnForNumber = {
      key: 'nomor',
      name: 'NO',
      width: 50,
      headerCellClass: 'column-headers'
    };

    const selectedDefault = [
      // columnForNumber,
      ...defaultColumns.filter((item: any) => checkedRows.has(item.key))
    ];

    const selectedDraggable = [
      ...itemDraggable.filter((item: any) => checkedRows.has(item.key))
    ];

    const selectedNotDraggable = [
      ...itemNotDraggable.filter((item: any) => checkedRows.has(item.key))
    ];

    const mergedItems = [columnForNumber, ...selectedDraggable];

    if (selectedNotDraggable.length > 0) {
      selectedNotDraggable.forEach((item) => {
        if (item.order >= mergedItems.length) {
          mergedItems.push(item);
        } else {
          mergedItems.splice(item.order, 0, item);
        }
      });
    }

    const orderedItems = mergedItems.map((item) =>
      selectedDefault.findIndex((def) => def.key === item.key)
    );

    const columnsWidth = mergedItems.reduce((acc: any, item: any) => {
      acc[item.key] = item.width;
      return acc;
    }, {});

    setColumnsWidth(columnsWidth);
    setColumnsOrder(orderedItems);
    saveGridConfig(userId, gridName, [...orderedItems], columnsWidth);
  };

  function mergeColumnsBySavedOrder(
    defaultColumns: any[],
    savedColumns: any[]
  ) {
    // Map default columns by key
    // const defaultKey = new Map(defaultColumns.map((col) => [col.key, col]));

    // Ambil dan order kolom default yg key nya ada di savedColumns dan filter dgn yg hanya ada properti draggable
    // const orderedBySaved = savedColumns
    //   .map((saved) => defaultKey.get(saved.key))
    //   .filter((col) => col && col.draggable !== undefined);

    const usedKeys = new Set(savedColumns.map((col) => col.key));
    setCheckedRows(usedKeys);

    // Keluarkan dari default kolom yg key nya tidak ada di savedColumn
    const columnsNotSaved = defaultColumns.filter(
      (col) => !usedKeys.has(col.key) && col.draggable !== undefined
    );

    const fixItems = [...savedColumns, ...columnsNotSaved]
      .filter((i) => i && i.draggable !== undefined)
      .map((col: any, idx: number) => ({
        ...col,
        id: col.key,
        order: idx + 1
      }));

    return fixItems;
  }

  useEffect(() => {
    if (!open) {
      setCheckedRows(new Set());
      return;
    }

    const finalColumns = mergeColumnsBySavedOrder(defaultColumns, saveColumns);
    console.log('finalcolumn', finalColumns);

    const filterItemDraggable = finalColumns.filter((item: any) => {
      return item.draggable === true;
    });

    const filterItemNotDraggable = finalColumns.filter((item: any) => {
      return item.draggable === false;
    });

    const largestWidth = defaultColumns.reduce((max: any, col: any) => {
      return col.width > max ? col.width : max;
    }, 0);

    setItems(finalColumns);
    setItemDraggable(filterItemDraggable);
    setItemNotDraggable(filterItemNotDraggable);
    setPopoverWidth(largestWidth + 70);
  }, [open]);

  console.log('checkedRows', checkedRows, open);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className={`${
            isDark ? 'text-white' : 'text-gray-600'
          } bg-transparent text-2xl hover:bg-transparent`}
        >
          <IoSettingsSharp />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        id="popover-content"
        className="mr-7 h-fit w-[full] rounded-md rounded-t-sm border border-b border-border bg-background-input p-2 shadow-lg"
        side="bottom"
        align="start"
        sideOffset={-1} // Atur offset ke 0 agar tidak ada jarak
        avoidCollisions={true}
        style={{
          width: popoverWidth
        }}
        onEscapeKeyDown={() => {
          setOpen(false);
          setPopoverWidth('auto');
          setCheckedRows(new Set());
        }}
      >
        {open && (
          <div className="flex h-[300px] flex-col">
            <div ref={scrollRef} className="h-full overflow-y-scroll">
              <Nestable
                maxDepth={1}
                items={itemDraggable}
                onChange={handleChange}
                renderItem={(props) => (
                  <div>
                    <div style={{ cursor: 'move' }}>{renderItem(props)}</div>
                  </div>
                )}
                disableCollapse={true}
                handler={<span className="drag-handle text-xl">☰</span>}
                disableDrag={(item) => item.item.draggable}
                onDragStart={() => {
                  window.addEventListener('mousemove', handleDragMouseMove);
                  window.addEventListener('blur', stopAutoScroll);

                  setTimeout(() => {
                    applyDynamicTransformFix();
                  }, 0);
                }}
                onDragEnd={() => {
                  window.removeEventListener('mousemove', handleDragMouseMove);
                  window.removeEventListener('blur', stopAutoScroll);

                  const dragLayer = document.querySelector(
                    '.nestable-drag-layer'
                  ) as HTMLElement;
                  if (dragLayer) {
                    dragLayer.style.transform = 'none'; // ✅ balikin normal
                  }
                }}
              />
              {renderItemNotDraggable()}
            </div>
            <div className="mt-4 flex flex-row gap-2">
              <Button
                variant="save"
                onClick={() => {
                  setOpen(false);
                  handleSave();
                  setCheckedRows(new Set());
                }}
              >
                Save
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setOpen(false);
                  resetGridConfig(
                    userId,
                    gridName,
                    defaultColumns,
                    setColumnsOrder,
                    setColumnsWidth
                  );
                  setCheckedRows(new Set());
                  onReset();
                }}
              >
                RESET
              </Button>
              <Button
                variant="default"
                className="bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
                onClick={() => {
                  setOpen(false);
                  setCheckedRows(new Set());
                }}
              >
                CANCEL
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>

    // <Popover open={open} onOpenChange={setOpen}>
    //   <PopoverAnchor
    //     style={{
    //       position: 'fixed',
    //       top: contextMenu?.y || 0,
    //       left: contextMenu?.x || 0,
    //       width: 1,
    //       height: 1,
    //     }}
    //   />

    //   <PopoverContent
    //     id="popover-content"
    //     className="rounded-md border w-[full] bg-white p-2 shadowinset-0 mt-8 mr-1 rounded-t-sm border-b border-blue-500 h-fit overflow-hidden"
    //     style={{
    //       width: popoverWidth,
    //       top: contextMenu.y * 2, // Pastikan contextMenu.y berasal dari event.clientY
    //       left: contextMenu.x,
    //     }}
    //   >
    //     {isOpen && (
    //       <div className='h-[300px] flex flex-col'>
    //         <div ref={scrollRef} className='overflow-y-scroll h-full'>
    //           <Nestable
    //             maxDepth={1}
    //             items={itemDraggable}
    //             onChange={handleChange}
    //             renderItem={(props) => (
    //               <div>
    //                 <div style={{ cursor: 'move' }}>{renderItem(props)}</div>
    //               </div>
    //             )}
    //             disableCollapse={true}
    //             handler={<span className="drag-handle">☰</span>}
    //             disableDrag={(item) => item.item.draggable}
    //             onDragStart={() => {
    //               window.addEventListener('mousemove', handleDragMouseMove);
    //             }}
    //             onDragEnd={() => {
    //               window.removeEventListener('mousemove', handleDragMouseMove);
    //             }}
    //           />
    //           {renderItemNotDraggable()}
    //         </div>
    //         <div className="mt-4 flex flex-row gap-2">
    //           <Button
    //             variant="save"
    //             onClick={() => {
    //               setOpen(false)
    //               handleSave()
    //               setCheckedRows(new Set());
    //             }}
    //           >
    //             Save
    //           </Button>
    //           <Button
    //             variant="destructive"
    //             onClick={() => {
    //               setOpen(false)
    //               resetGridConfig(
    //                 userId,
    //                 gridName,
    //                 defaultColumns,
    //                 setColumnsOrder,
    //                 setColumnsWidth
    //               );
    //               setCheckedRows(new Set());
    //               // setContextMenu(null);
    //               // setDataGridKey((prevKey) => prevKey + 1);
    //               // gridRef?.current?.selectCell({ rowIdx: 0, idx: 0 });
    //             }}
    //           >
    //             RESET
    //           </Button>
    //           <Button
    //             variant="default"
    //             className="bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
    //             onClick={() => {
    //               setOpen(false)
    //               setCheckedRows(new Set());
    //             }}
    //           >
    //             CANCEL
    //           </Button>
    //         </div>
    //       </div>
    //     )}

    //   </PopoverContent>
    // </Popover>
  );
}

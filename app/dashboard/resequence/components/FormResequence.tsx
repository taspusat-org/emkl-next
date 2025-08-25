'use client';
import React, { useEffect, useState } from 'react';
import Nestable, { Item as NestableItem } from 'react-nestable';
import { AiFillCaretRight, AiFillCaretDown } from 'react-icons/ai';
import 'react-nestable/dist/styles/index.css';
import { getMenuResequence } from '@/lib/apis/menu.api';
import { useUpdateMenuResequence } from '@/lib/server/useMenu';
import { Button } from '@/components/ui/button';
import { useAlert } from '@/lib/store/client/useAlert';
import { useDispatch } from 'react-redux';
import {
  setProcessed,
  setProcessing
} from '@/lib/store/loadingSlice/loadingSlice';
import { useRouter } from 'next/navigation';

type Item = NestableItem & {
  amount?: number;
};

const styles: React.CSSProperties = {
  position: 'relative',
  background: 'WhiteSmoke',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer' // Makes the entire element draggable
};

const cssCenter: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const renderItem = (props: {
  item: Item;
  index: number;
  depth: number;
  isDraggable: boolean;
  collapseIcon: React.ReactNode;
}): JSX.Element => {
  const { item, index, collapseIcon } = props;

  return (
    <div
      style={{
        ...styles,
        fontWeight: item.children ? '700' : '400'
      }}
    >
      {collapseIcon}
      <div style={{ ...cssCenter, color: 'black', width: '3rem' }}>
        {index !== undefined ? index + 1 : ''}
      </div>
      <div
        style={{
          padding: '.5rem',
          flex: 1,
          color: 'black'
        }}
        className="text-sm"
      >
        {item.text}
      </div>
    </div>
  );
};

export default function App(): JSX.Element {
  const [collapseAll, setCollapseAll] = useState(false);
  const [items, setItems] = useState<Item[]>([]); // Initially empty
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const { mutate: updateMenu, isLoading: isLoadingUpdate } =
    useUpdateMenuResequence();
  const { alert } = useAlert();

  const Collapser = (props: { isCollapsed: boolean }): JSX.Element => {
    const { isCollapsed } = props;
    return (
      <div style={{ ...cssCenter, width: '2rem', cursor: 'pointer' }}>
        {isCollapsed ? (
          <AiFillCaretRight className="text-zinc-600" />
        ) : (
          <AiFillCaretDown className="text-zinc-600" />
        )}
      </div>
    );
  };
  useEffect(() => {
    dispatch(setProcessing());

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        const result = await getMenuResequence();
        if (result) {
          setItems(result); // Update the state with fetched data
        } else {
          setError('Failed to fetch menu data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
        dispatch(setProcessed());
      }
    };

    fetchData();
  }, []);

  const handleChange = (options: {
    items: Item[];
    dragItem: Item;
    targetPath: number[];
  }) => {
    setItems(options.items); // Update items
  };

  const handleSubmit = () => {
    const payload = { data: items }; // Bungkus data dengan properti 'data'
    updateMenu(payload, {
      onSuccess: () => {
        alert({
          title: 'MENU BERHASIL DIUBAH!',
          variant: 'success',
          submitText: 'ok'
        });
      },
      onError: (error: any) => {
        console.error('Error updating menu:', error);
        alert({
          title: 'MENU GAGAL DIUPDATE!',
          variant: 'danger',
          submitText: 'ok'
        });
      }
    });
  };

  if (loading) {
    return <div>Loading menu data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="App bg-white shadow-lg" style={{ padding: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="text-xl font-bold text-zinc-600">Resequence Menu</h1>
        <Button
          variant="secondary"
          onClick={() => setCollapseAll(!collapseAll)}
        >
          {collapseAll ? 'Expand all' : 'Collapse all'}
        </Button>
      </header>
      <Nestable
        items={items}
        onChange={handleChange} // Capture changes
        renderItem={(props) => (
          <div>
            <div style={{ cursor: 'move' }}>{renderItem(props)}</div>
          </div>
        )}
        renderCollapseIcon={({ isCollapsed }) => (
          <Collapser isCollapsed={isCollapsed} />
        )}
        collapsed={collapseAll}
      />
      <footer className="mt-4 flex flex-row gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isLoadingUpdate}
          variant="save"
        >
          {isLoadingUpdate ? 'Updating...' : 'Save'}
        </Button>
        <Button
          className="bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
          onClick={() => router.back()}
          disabled={isLoadingUpdate}
          variant="default"
        >
          BACK
        </Button>
      </footer>
    </div>
  );
}

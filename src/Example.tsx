import { useEffect, useState } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { genUUID } from 'electric-sql/util'
import { Items as Item } from './generated/client'
import { useElectric } from './ElectricProvider'

import './Example.css'

export const Example = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.items.liveMany({
    orderBy: { created_at: 'desc' },
  }))
  const [syncDone, setSyncDone] = useState(true)

  useEffect(() => {
    const syncItems = async () => {
      // Resolves when the shape subscription has been established.
      const shape = await db.items.sync({
        where:  {...(syncDone ? {} : { done: false })},
        key: 'items',
      })

      // Resolves when the data has been synced into the local database.
      await shape.synced
    }

    syncItems()
  }, [syncDone])

  const addItem = async () => {
    await db.items.create({
      data: {
        value: genUUID(),
        task: 'New task',
        done: false,
        created_at: new Date(),
      },
    })
  }

  const clearItems = async () => {
    await db.items.deleteMany({
      where: { done: true },
    })
  }

  const items: Item[] = results ?? []

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear Done
        </button>
        <label className="label">
          Sync done tasks
          <input
            type="checkbox"
            checked={syncDone}
            onChange={() => setSyncDone(!syncDone)}
          />
        </label>
      </div>
      {items.map((item: Item, index: number) => (
        <ItemLine key={index} item={item} />
      ))}
    </div>
  )
}

const ItemLine = ({ item }: { item: Item }) => {
  const { db } = useElectric()!

  const updateItem = async (task: string) => {
    await db.items.update({
      where: { value: item.value },
      data: { task },
    })
  }

  const toggleDone = async () => {
    await db.items.update({
      where: { value: item.value },
      data: { done: !item.done },
    })
  }

  return (
    <p className={`item ${item.done ? 'done' : ''}`}>
      <input
        type="checkbox"
        className="item-checkbox"
        checked={!!item.done}
        onChange={toggleDone}
      />
      <input
        type="text"
        className="item-input"
        value={item.task ?? ''}
        onChange={(e) => {
          updateItem(e.currentTarget.value)
        }}
      />
      <button
        className="delete-button"
        onClick={() => {
          db.items.delete({ where: { value: item.value } })
        }}
      >Delete</button>
    </p>
  )
} 
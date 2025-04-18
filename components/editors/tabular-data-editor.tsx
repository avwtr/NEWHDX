"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit2, Check, X, ArrowDown, ArrowUp, ChevronDown, ArrowLeft, ArrowRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TabularDataEditorProps {
  data: {
    columns: string[]
    rows: string[][]
  }
  onChange: (data: { columns: string[]; rows: string[][] }) => void
  readOnly?: boolean
}

export function TabularDataEditor({ data, onChange, readOnly = false }: TabularDataEditorProps) {
  const [editingColumn, setEditingColumn] = useState<number | null>(null)
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [tempColumnName, setTempColumnName] = useState("")
  const [tempCellValue, setTempCellValue] = useState("")

  const addColumn = () => {
    if (readOnly) return
    const newColumns = [...data.columns, `Column ${data.columns.length + 1}`]
    const newRows = data.rows.map((row) => [...row, ""])
    onChange({ columns: newColumns, rows: newRows })
  }

  const removeColumn = (index: number) => {
    if (readOnly) return
    const newColumns = data.columns.filter((_, i) => i !== index)
    const newRows = data.rows.map((row) => row.filter((_, i) => i !== index))
    onChange({ columns: newColumns, rows: newRows })
  }

  const startEditingColumn = (index: number) => {
    if (readOnly) return
    setEditingColumn(index)
    setTempColumnName(data.columns[index])
  }

  const saveColumnEdit = () => {
    if (readOnly) return
    if (editingColumn !== null) {
      const newColumns = [...data.columns]
      newColumns[editingColumn] = tempColumnName
      onChange({ columns: newColumns, rows: data.rows })
      setEditingColumn(null)
    }
  }

  const cancelColumnEdit = () => {
    setEditingColumn(null)
  }

  const addRow = () => {
    if (readOnly) return
    const newRow = Array(data.columns.length).fill("")
    onChange({ columns: data.columns, rows: [...data.rows, newRow] })
  }

  const removeRow = (index: number) => {
    if (readOnly) return
    const newRows = data.rows.filter((_, i) => i !== index)
    onChange({ columns: data.columns, rows: newRows })
  }

  const startEditingCell = (row: number, col: number) => {
    if (readOnly) return
    setEditingCell({ row, col })
    setTempCellValue(data.rows[row][col])
  }

  const saveCellEdit = () => {
    if (readOnly) return
    if (editingCell !== null) {
      const newRows = [...data.rows]
      newRows[editingCell.row][editingCell.col] = tempCellValue
      onChange({ columns: data.columns, rows: newRows })
      setEditingCell(null)
    }
  }

  const cancelCellEdit = () => {
    setEditingCell(null)
  }

  const moveColumnLeft = (index: number) => {
    if (readOnly) return
    if (index === 0) return
    const newColumns = [...data.columns]
    const temp = newColumns[index]
    newColumns[index] = newColumns[index - 1]
    newColumns[index - 1] = temp

    const newRows = data.rows.map((row) => {
      const newRow = [...row]
      const temp = newRow[index]
      newRow[index] = newRow[index - 1]
      newRow[index - 1] = temp
      return newRow
    })

    onChange({ columns: newColumns, rows: newRows })
  }

  const moveColumnRight = (index: number) => {
    if (readOnly) return
    if (index === data.columns.length - 1) return
    const newColumns = [...data.columns]
    const temp = newColumns[index]
    newColumns[index] = newColumns[index + 1]
    newColumns[index + 1] = temp

    const newRows = data.rows.map((row) => {
      const newRow = [...row]
      const temp = newRow[index]
      newRow[index] = newRow[index + 1]
      newRow[index + 1] = temp
      return newRow
    })

    onChange({ columns: newColumns, rows: newRows })
  }

  const moveRowUp = (index: number) => {
    if (readOnly) return
    if (index === 0) return
    const newRows = [...data.rows]
    const temp = newRows[index]
    newRows[index] = newRows[index - 1]
    newRows[index - 1] = temp
    onChange({ columns: data.columns, rows: newRows })
  }

  const moveRowDown = (index: number) => {
    if (readOnly) return
    if (index === data.rows.length - 1) return
    const newRows = [...data.rows]
    const temp = newRows[index]
    newRows[index] = newRows[index + 1]
    newRows[index + 1] = temp
    onChange({ columns: data.columns, rows: newRows })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Tabular Data Editor</h3>
        {!readOnly && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addRow} className="text-xs">
              <Plus className="h-3 w-3 mr-1" /> Add Row
            </Button>
            <Button variant="outline" size="sm" onClick={addColumn} className="text-xs">
              <Plus className="h-3 w-3 mr-1" /> Add Column
            </Button>
          </div>
        )}
      </div>

      <div className="border rounded-md overflow-auto max-h-[350px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] text-center">#</TableHead>
              {data.columns.map((column, index) => (
                <TableHead key={index} className="min-w-[150px]">
                  <div className="flex items-center justify-between">
                    {editingColumn === index ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={tempColumnName}
                          onChange={(e) => setTempColumnName(e.target.value)}
                          className="h-7 py-1 text-xs"
                          autoFocus
                        />
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveColumnEdit}>
                          <Check className="h-3 w-3 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelColumnEdit}>
                          <X className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{column}</span>
                        {!readOnly && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => startEditingColumn(index)}>
                                <Edit2 className="h-3 w-3 mr-2" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => moveColumnLeft(index)}>
                                <ArrowLeft className="h-3 w-3 mr-2" /> Move Left
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => moveColumnRight(index)}>
                                <ArrowRight className="h-3 w-3 mr-2" /> Move Right
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => removeColumn(index)} className="text-red-500">
                                <Trash2 className="h-3 w-3 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </>
                    )}
                  </div>
                </TableHead>
              ))}
              {!readOnly && <TableHead className="w-[80px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="text-center font-medium">{rowIndex + 1}</TableCell>
                {row.map((cell, colIndex) => (
                  <TableCell key={colIndex}>
                    {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={tempCellValue}
                          onChange={(e) => setTempCellValue(e.target.value)}
                          className="h-7 py-1 text-xs"
                          autoFocus
                        />
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveCellEdit}>
                          <Check className="h-3 w-3 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelCellEdit}>
                          <X className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={`min-h-[24px] px-2 py-1 rounded ${!readOnly ? "hover:bg-secondary/50 cursor-pointer" : ""}`}
                        onClick={() => !readOnly && startEditingCell(rowIndex, colIndex)}
                      >
                        {cell || <span className="text-muted-foreground text-xs italic">Empty</span>}
                      </div>
                    )}
                  </TableCell>
                ))}
                {!readOnly && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveRowUp(rowIndex)}
                        disabled={rowIndex === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveRowDown(rowIndex)}
                        disabled={rowIndex === data.rows.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500"
                        onClick={() => removeRow(rowIndex)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {data.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={data.columns.length + (readOnly ? 1 : 2)} className="text-center py-4">
                  <div className="text-muted-foreground">
                    {readOnly
                      ? "No data available in this file."
                      : 'No data yet. Click "Add Row" to start adding data.'}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

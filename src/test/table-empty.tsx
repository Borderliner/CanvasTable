import CanvasTable from '@/core/CanvasTable'

function tableCreate() {
    const wrapper = document.createElement('div')
    document.body.appendChild(wrapper)
    const columns = colMock()

    const ct = new CanvasTable({
        container: wrapper,
        columns: columns,
        style: { height: 1000, width: 800 },
        onRow: (record, index) => ({
            onClick: () => {
                alert(JSON.stringify(record))
            },
        }),
    })

    ct.source = [{ col1: 1, col2: 2, col3: 3 }]
}

function colMock() {
    let columns = []
    for (let i = 0; i < 3; i++) {
        columns.push({
            dataIndex: `col${i + 1}`,
            title: `col${i + 1}`,
            popTitle: `col${i + 1}-pop`,
        })
    }
    return columns
}

tableCreate()

import CanvasTable from '@/core/CanvasTable'

function tableCreate() {
    const wrapper = document.createElement('div')
    document.body.appendChild(wrapper)
    const columns = colMock()

    const ct = new CanvasTable({
        container: wrapper,
        columns: columns,
        style: { height: 300, width: 800 },
        onRow: (record, index) => ({
            onClick: () => {
                alert(JSON.stringify(record))
            },
        }),
    })

    const refreshTime = Math.floor(Math.random() * 100) + 400 // slow
    // const refreshTime = 500 // fast
    ct.source = []
    setTimeout(() => {
        ct.source = dataMock(50)
    }, 3000)
}

function dataMock(len: number) {
    let data = []
    for (let j = 0; j < len; j++) {
        let row: any = {}
        Array.from({ length: 10 }).forEach((col, i) => {
            row[`col${i + 1}`] = Math.floor(Math.random() * 10000)
        })
        data.push(row)
    }
    return data
}

function colMock() {
    let columns = []
    for (let i = 0; i < 10; i++) {
        columns.push({
            dataIndex: `col${i + 1}`,
            title: `col${i + 1}`,
            popTitle: `col${i + 1}-pop`,
        })
    }
    return columns
}

tableCreate()
tableCreate()
tableCreate()
tableCreate()
tableCreate()
tableCreate()
tableCreate()
tableCreate()
tableCreate()
tableCreate()

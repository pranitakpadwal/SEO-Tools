import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, Packer } from 'docx'

export function exportToExcel(data, channelName) {
  const wb = XLSX.utils.book_new()

  // Sheet 1: Overview
  const overview = [
    ['YouTube Channel Publishing Report'],
    ['Channel', channelName],
    ['Report Generated', new Date().toLocaleString()],
    [''],
    ['PUBLISHING FREQUENCY (Last 30 Days)'],
    ['Metric', 'Videos', 'Shorts'],
    ['Per Day', data.regular.perDay, data.shorts.perDay],
    ['Per Week', data.regular.perWeek, data.shorts.perWeek],
    ['Per Month', data.regular.last30Days, data.shorts.last30Days],
    [''],
    ['HISTORICAL COMPARISON'],
    ['Period', 'Regular Videos', 'Shorts'],
    ['Last 30 Days', data.regular.last30Days, data.shorts.last30Days],
    ['Last 90 Days', data.regular.last90Days, data.shorts.last90Days],
    ['Last 12 Months', data.regular.lastYear, '—'],
    [''],
    ['CONSISTENCY SCORE'],
    ['Score (out of 100)', data.consistencyScore],
    ['Video Benchmark', data.benchmark.videoStatus],
    ['Shorts Benchmark', data.benchmark.shortsStatus],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(overview)
  ws1['!cols'] = [{ width: 35 }, { width: 25 }, { width: 25 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Overview')

  // Sheet 2: Monthly Breakdown
  const monthlyData = [['Month', 'Regular Videos', 'Shorts', 'Total']]
  data.monthlyBuckets.forEach(b => monthlyData.push([b.label, b.videos, b.shorts, b.videos + b.shorts]))
  const ws2 = XLSX.utils.aoa_to_sheet(monthlyData)
  ws2['!cols'] = [{ width: 15 }, { width: 20 }, { width: 15 }, { width: 10 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Monthly Breakdown')

  // Sheet 3: Weekly Breakdown
  const weeklyData = [['Week', 'Date', 'Regular Videos', 'Shorts']]
  data.weeklyBuckets.forEach(b => weeklyData.push([b.label, b.date, b.videos, b.shorts]))
  const ws3 = XLSX.utils.aoa_to_sheet(weeklyData)
  ws3['!cols'] = [{ width: 10 }, { width: 20 }, { width: 20 }, { width: 15 }]
  XLSX.utils.book_append_sheet(wb, ws3, 'Weekly Breakdown')

  // Sheet 4: Inactive Periods
  const inactiveData = [['From', 'To', 'Gap (Days)']]
  if (data.inactivePeriods.length > 0) {
    data.inactivePeriods.forEach(p => inactiveData.push([p.from, p.to, p.days]))
  } else {
    inactiveData.push(['No significant inactive periods detected', '', ''])
  }
  const ws4 = XLSX.utils.aoa_to_sheet(inactiveData)
  ws4['!cols'] = [{ width: 25 }, { width: 25 }, { width: 15 }]
  XLSX.utils.book_append_sheet(wb, ws4, 'Inactive Periods')

  // Sheet 5: All Videos
  const videoData = [['Title', 'Published Date', 'Type']]
  data.videos.forEach(v => videoData.push([
    v.title,
    v.publishedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    v.isShort ? 'Short' : 'Video',
  ]))
  const ws5 = XLSX.utils.aoa_to_sheet(videoData)
  ws5['!cols'] = [{ width: 60 }, { width: 20 }, { width: 10 }]
  XLSX.utils.book_append_sheet(wb, ws5, 'All Videos')

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `${channelName}_publishing_report.xlsx`)
}

export async function exportToWord(data, channelName) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: 'YouTube Channel Publishing Report',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new TextRun({ text: `Channel: ${channelName}`, bold: true, size: 24 })],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `Report Generated: ${new Date().toLocaleString()}`, color: '666666', size: 20 })],
          spacing: { after: 400 },
        }),

        new Paragraph({ text: 'Publishing Frequency (Last 30 Days)', heading: HeadingLevel.HEADING_2 }),
        createTable([
          ['Metric', 'Regular Videos', 'Shorts'],
          ['Per Day', String(data.regular.perDay), String(data.shorts.perDay)],
          ['Per Week', String(data.regular.perWeek), String(data.shorts.perWeek)],
          ['Per Month', String(data.regular.last30Days), String(data.shorts.last30Days)],
        ]),
        new Paragraph({ text: '', spacing: { after: 300 } }),

        new Paragraph({ text: 'Historical Comparison', heading: HeadingLevel.HEADING_2 }),
        createTable([
          ['Period', 'Regular Videos', 'Shorts'],
          ['Last 30 Days', String(data.regular.last30Days), String(data.shorts.last30Days)],
          ['Last 90 Days', String(data.regular.last90Days), String(data.shorts.last90Days)],
          ['Last 12 Months', String(data.regular.lastYear), '—'],
        ]),
        new Paragraph({ text: '', spacing: { after: 300 } }),

        new Paragraph({ text: 'Consistency & Benchmarking', heading: HeadingLevel.HEADING_2 }),
        createTable([
          ['Metric', 'Value'],
          ['Consistency Score', `${data.consistencyScore}/100`],
          ['Video Benchmark', data.benchmark.videoStatus],
          ['Shorts Benchmark', data.benchmark.shortsStatus],
          ['Recommended Videos/Week', data.benchmark.recommendedVideosPerWeek],
          ['Recommended Shorts/Week', data.benchmark.recommendedShortsPerWeek],
        ]),
        new Paragraph({ text: '', spacing: { after: 300 } }),

        ...(data.inactivePeriods.length > 0 ? [
          new Paragraph({ text: 'Inactive Publishing Periods', heading: HeadingLevel.HEADING_2 }),
          createTable([
            ['From', 'To', 'Gap (Days)'],
            ...data.inactivePeriods.map(p => [p.from, p.to, String(p.days)]),
          ]),
          new Paragraph({ text: '', spacing: { after: 300 } }),
        ] : [
          new Paragraph({
            children: [new TextRun({ text: 'No significant inactive periods detected (21+ day gaps).', italics: true, color: '22c55e' })],
          }),
        ]),

        new Paragraph({ text: 'Monthly Video Breakdown', heading: HeadingLevel.HEADING_2 }),
        createTable([
          ['Month', 'Videos', 'Shorts', 'Total'],
          ...data.monthlyBuckets.map(b => [b.label, String(b.videos), String(b.shorts), String(b.videos + b.shorts)]),
        ]),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${channelName}_publishing_report.docx`)
}

function createTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((cells, rowIndex) =>
      new TableRow({
        children: cells.map(cell =>
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({
                text: cell,
                bold: rowIndex === 0,
                size: rowIndex === 0 ? 20 : 18,
              })],
            })],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: '4f5ff7' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: '4f5ff7' },
              left: { style: BorderStyle.SINGLE, size: 1, color: '4f5ff7' },
              right: { style: BorderStyle.SINGLE, size: 1, color: '4f5ff7' },
            },
            shading: rowIndex === 0 ? { fill: '3a3fec' } : {},
          })
        ),
      })
    ),
  })
}

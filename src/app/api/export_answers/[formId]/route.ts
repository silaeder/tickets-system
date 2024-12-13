import { NextResponse } from 'next/server';
import prisma from '../../../db/db';
import ExcelJS from 'exceljs';

export async function GET(
  request: Request,
  { params }: { params: { formId: string } }
) {
  try {
    // Получаем ответы на форму из базы данных
    const answers = await prisma.answer.findMany({
      where: {
        formId: parseInt(params.formId)
      },
      include: {
        user: {
          select: {
            name: true,
            surname: true,
            second_name: true,
          }
        },
        form: {
          select: {
            form_description: true
          }
        },
        status: true
      }
    });

    if (!answers.length) {
      return NextResponse.json({ error: 'Ответы не найдены' }, { status: 404 });
    }

    // Создаем рабочую книгу и лист
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ответы на форму');

    // Получаем описания полей из первого ответа
    const formDescription = answers[0].form.form_description as Array<{
      id: string;
      label: string;
      type: string;
    }>;
    
    // Устанавливаем заголовки
    const headers = [
      'Имя',
      'Фамилия', 
      'Отчество',
      'Статус',
      ...formDescription.map(f => f.label)
    ];
    const headerRow = worksheet.addRow(headers);
    
    // Стилизуем заголовки
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '397698' }
      };
      cell.font = {
        color: { argb: 'FFFFFF' },
        bold: true
      };
    });

    // Добавляем строки с данными
    answers.forEach(answer => {
      const status = answer.status?.approved ? 'Одобрено' : 
                    answer.status?.waiting ? 'Ожидает проверки' :
                    answer.status?.edits_required ? 'Требуются правки' : 
                    'Отклонено';

      const answerData = answer.answers as Record<string, any>;
      const row = [
        answer.user?.name || '',
        answer.user?.surname || '',
        answer.user?.second_name || '',
        status
      ];

      // Добавляем значения ответов в порядке соответствия заголовкам
      formDescription.forEach(field => {
        const value = answerData[field.id];
        row.push(field.type === 'checkbox' ? (value === 'true' ? 'Да' : 'Нет') : value?.toString() || '');
      });

      worksheet.addRow(row);
    });

    // Генерируем Excel файл
    const buffer = await workbook.xlsx.writeBuffer();

    // Возвращаем ответ с Excel файлом
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=form_${params.formId}_answers.xlsx`
      }
    });

  } catch (error) {
    console.error('Ошибка экспорта в Excel:', error);
    return NextResponse.json(
      { error: 'Не удалось экспортировать ответы в Excel' },
      { status: 500 }
    );
  }
}

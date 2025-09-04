import React, { useEffect, useState } from 'react';
import './Invoice.css';
import { getOfferById } from '../../api/offerAPI';
import { useParams } from 'react-router-dom';

const Invoice = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [totalamount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getOfferById(id);
        console.log('response', response);
        setData(response);
        const total = response.works.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
        setTotalAmount(total);  
      } catch (error) {
        console.error('Error fetching invoice data:', error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (data) {
      // تأخير الطباعة قليلاً لضمان تحميل كافة العناصر
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [data]);

  const invoiceData = {
    summary: [
      { title: 'الاجمالي', value: `${data?.totalAmount}` },
      { title: 'ضريبة القيمة المضافه %15 ', value: `${data?.taxAmount}` },
      { title: 'الاجمالي شامل ضريبة القيمه المضافه', value: `${data?.totalWithTax}` }
    ],
  };

  return (
    <div className="invoice-container">
      <div className="print-header">
        <img src="/Images/header.png" alt="Header" />
      </div>
      
      <div className="invoice-header">
        <div className='flex justify-between'>
          <h1>تاريخ العرض</h1>
          <h1>عرض رقم</h1>
        </div>

        <div className='offer-name'>
          <p>{data?.offerName}</p>
        </div>

        <div className="company-details">
          <div className="equal-columns gap-6 p-6 flex justify-between">
            <div className="border border-black">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="bg-highlight px-4 py-3 text-right font-medium border border-black">من</td>
                    <td className="px-4 py-3 text-right border border-black">ايفاء لأنظمة الامن والسلامة</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="bg-highlight px-4 py-3 text-right font-medium border border-black">البريد الالكتروني</td>
                    <td className="px-4 py-3 text-right border border-black">
                      <div className="text-blue-600">Hafez@EvaSaudi.com</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-highlight px-4 py-3 text-right font-medium border border-black">التواصل</td>
                    <td className="px-4 py-3 text-right border border-black">
                      <div className="text-blue-600">+966540800987</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border border-black">
              <table className="w-[300px]">
                <tbody>
                  <tr>
                    <td className="bg-highlight px-4 py-3 text-right font-medium border border-black">الى</td>
                    <td className="px-4 py-3 text-right border border-black">{data?.to}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="bg-highlight px-4 py-3 text-right font-medium border border-black">المشروع</td>
                    <td className="px-4 py-3 text-right border border-black">
                      <div className="text-blue-600">{data?.project}</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-highlight px-4 py-3 text-right font-medium border border-black">الموضوع</td>
                    <td className="px-4 py-3 text-right border border-black">
                      <div className="text-blue-600">{data?.subject}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className='my-6'>
          <p className='font-bold text-2xl'>يسرنا تقديم عرضنا التالي</p>
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th className='bg-highlight'>البند</th>
              <th className='bg-highlight text-center'>وصف العمل</th>
              <th className='bg-highlight'>الكمية</th>
              <th className='bg-highlight'>السعر</th>
              <th className='bg-highlight'>الاجمالي</th>
            </tr>
          </thead>
          <tbody>
            {data?.works.map((item, Idx) => {
              const total = item.price * item.quantity;
              return (
                <tr key={item.id}>
                  <td>{Idx + 1}</td>
                  <td className='text-right'>{item.workItem}</td>
                  <td className='text-right'>{item.quantity.toLocaleString()}</td>
                  <td className='text-right'>{item.price ? item.price.toLocaleString() : ''}</td>
                  <td className='text-right'>{total ? total.toLocaleString() : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="summary-section">
          <table className="items-table">
            <thead>
              <tr>
                <th className='bg-highlight'>البند</th>
                <th className='bg-highlight text-center'>وصف العمل</th>
                <th className='bg-highlight'>الاجمالي</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.summary.map((item, index) => (
                <tr key={index}>
                  <td className='bg-highlight'>{index + 1}</td>
                  <td>{item.title}</td>
                  <td>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-full">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="bg-highlight border border-black px-4 py-3 font-medium w-1/3">صلاحية العرض</td>
                <td className="border border-black px-4 py-3">عشرة أيام من تاريخ العرض إعلاه</td>
              </tr>
              <tr>
                <td className="bg-highlight border border-black px-4 py-3 font-medium">شروط الدفع</td>
                <td className="border border-black px-4 py-3">٤٠٪ نقداً</td>
              </tr>
              <tr>
                <td className="bg-highlight border border-black px-4 py-3 font-medium">الحساب البنكي</td>
                <td className="border border-black p-0">
                  <table className="w-full">
                    <tr>
                      <td className="border-b border-black px-4 py-3 font-medium bg-highlight w-1/3">IBAN Number</td>
                      <td className="border-b border-black px-4 py-3 text-red-500 font-bold">SA3280000449608016137886</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-highlight">Account Number</td>
                      <td className="px-4 py-3 text-red-500 font-bold">449000010006086137886</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className='print-footer'>
        <img src="/Images/footer.png" alt="Footer" />
      </div>
    </div>
  );
};

export default Invoice;
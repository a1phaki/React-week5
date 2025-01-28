import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import * as bootstrap from "bootstrap";

import Pagination from './Pagination';
import ReactLoading from 'react-loading';
import { useForm } from 'react-hook-form';
import validate from "validate.js";
 
const base_url = import.meta.env.VITE_BASE_URL;
const api_path = import.meta.env.VITE_API_PATH;

function App() {
  const [products,setProducts] = useState([]);
  const [pageInfo,setPageInfo] = useState({});
  const [cart,setCart] = useState([]);
  const [finalTotal,setFinaltotal] = useState(0);
  const [isLoading,setIsLoading] = useState(true);
  const [isLoadingId,setIsLoadingId] = useState(null);
  const productModalRef = useRef(null);
  const [selectedProduct,setSelectedProduct] = useState({
    title:'',
    imageUrl:'',
    content:'',
    description:'',
    price:0,
    origin_price:0,
    num:1
  })

  const {register ,handleSubmit ,formState: { errors },reset} = useForm();

  const getProducts = async(page = 1)=>{
    setIsLoading(true);
    
    try {
      const res = await axios.get(`${base_url}/api/${api_path}/products?page=${page}`);
      setProducts(res.data.products);
      setPageInfo(res.data.pagination);
    } catch (error) {
      alert(error.response.data.message);
    }finally{
      setIsLoading(false);
    }

  }

  const getCart = async()=>{
    try {
      const res = await axios.get(`${base_url}/api/${api_path}/cart`);
      setCart(res.data.data.carts);
      setFinaltotal(res.data.data.final_total);
      console.log(res.data.data.carts);
    } catch (error) {
      alert(error.response.data.message);
    }
  }

  const addCart = async(id,qty)=>{
    const data = {
      product_id:id,
      qty:qty
    }
    try {
      const res = await axios.post(`${base_url}/api/${api_path}/cart`,{data});
      getCart();
    } catch (error) {
      alert(error.response.data.message);
    }finally{
      closeModal();
    }
  }

  const updateCart = async(id,qty=1)=>{
    const data = {
      product_id:id,
      qty:qty
    }
    try {
      const res = await axios.put(`${base_url}/api/${api_path}/cart/${id}`);
      getCart();
    } catch (error) {
      alert(error.response.data.message);
    }
  }

  const deleteCart = async(id)=>{
    try {
      const res = await axios.delete(`${base_url}/api/${api_path}/cart/${id}`);
      getCart();
    } catch (error) {
      alert(error.response.data.message);
    }
  }

  const deleteAllCart = async()=>{
    try {
      const res = await axios.delete(`${base_url}/api/${api_path}/carts`);
      getCart();
    } catch (error) {
      alert(error.response.data.message);
    }
  }

  useEffect(()=>{
    getProducts();
    getCart();
  },[])

  useEffect(()=>{
    productModalRef.current = new bootstrap.Modal("#productModal", {
        keyboard: false,
    });
  },[])

  const openModal = async(id)=>{
    setIsLoadingId(id);
    try {
      const res = await axios.get(`${base_url}/api/${api_path}/product/${id}`);
      setSelectedProduct(res.data.product);
      productModalRef.current.show();
    } catch (error) {
      alert(error.response.data.message);
    }finally{
      setIsLoadingId(null);
    }
  }

  const closeModal = ()=>{
    productModalRef.current.hide();
  }

  const handleModalChange = (num)=>{
    if(num >= 1){
      setSelectedProduct({
        ...selectedProduct,
        num:num
      })
    }
  }

  const handlePageChange = (page)=>{
    getProducts(page);
  }

  const validateForm = (data) => {
    const validationErrors = validate(data);
    return validationErrors || {};
  };




  const onSubmit = async(data) =>{
    const validationErrors = validateForm(data);
    if(Object.keys(validationErrors).length === 0){
      try {
        const res = await axios.post(`${base_url}/api/${api_path}/order`,
          {
            data:{
              user:data,
              message:data.message
            }
          }
        );
        reset();
        getCart();
      } catch (error) {
        alert(error.response.data.message);
      }
    }
  }

  return (
    <>
      {
        isLoading ?  
        <div className="loading-overlay">
          <ReactLoading type="spokes" color="#ffc107" height={100} width={100} />
        </div> :
        <div className="container mt-5">
          <div className='mb-5'>
            <table className='table align-middle'>
              <thead>
                <tr>
                  <th scope="col" width='20%' className='text-center'>圖片</th>
                  <th scope="col" width='20%' className='text-center'>產品名稱</th>
                  <th scope="col" width='20%' className='text-center'>價錢</th>
                  <th scope="col" width='40%' className='text-center'></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product)=>(
                  <tr key={product.id}>
                    <td className='text-center'><img src={product.imageUrl} alt="圖片" className='table-img'/></td>
                    <td className='text-center'>{product.title}</td>
                    <td className='text-center'>
                      <del>原價：{product.origin_price}元</del>
                      <h5>特價：{product.price}元</h5>
                    </td>
                    <td className='text-center'>
                      <div className="btn-group">
                        <button className='btn btn-outline-secondary d-flex align-middle' onClick={()=>openModal(product.id)} disabled={isLoadingId===product.id}>
                        {
                          isLoadingId===product.id? 
                          <ReactLoading type="spin" color="#ffc107" height={20} width={20}/>:
                          "查看更多"
                        }
                        </button>
                        <button className='btn btn-outline-warning' onClick={()=>addCart(product.id,1)}>加入購物車</button>
                      </div>
                    </td>
                  </tr>
                  ))}
              </tbody>
            </table>
            <Pagination pageInfo={pageInfo} handlePageChange={handlePageChange}></Pagination>
          </div>
          <div className="mb-5">
            <table className='table align-middle'>
              <thead>
                <tr>
                  <th scope="col" width='15%' className='text-center'></th>
                  <th scope="col" width='20%' className='text-center'>品名</th>
                  <th scope="col" width='50%' className='text-center'>數量/單位</th>
                  <th scope="col" width='15%' className='text-center'>單價</th>
                </tr>
              </thead>
              <tbody>
                {
                  cart.map((item)=>(
                    <tr key={item.id}>
                      <td className='text-center'>
                        <button className='btn btn-outline-danger' onClick={()=>deleteCart(item.id)}>刪除</button>
                      </td>
                      <td className='text-center'>{item.product.title}</td>
                      <td>
                        <div className="input-group input-group-sm">
                          <input type="number" min='1' className='form-control' defaultValue={item.qty} onChange={()=>updateCart(item.id,item.qty)}/>
                          <div className="input-group-text">
                            /{item.product.unit}
                          </div>
                        </div>
                      </td>
                      <td className='text-center'>{item.product.price}</td>
                    </tr>
                  ))
                }
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  <td></td>
                  <td className='text-end'>總計</td>
                  <td className='text-center'>{finalTotal}</td>
                </tr>
              </tfoot>
            </table>
            <div className="py-3 text-end">
              <button type='button' className='btn btn-outline-danger' onClick={deleteAllCart}>清空購物車</button>
            </div>
          </div>
          <div className="mb-5">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="py-3 row">
                <label htmlFor="name" className="col-sm-3 col-form-label">收件人姓名</label>
                <div className="col-sm-9">
                  <input type="text" className="form-control" id="name"  placeholder='請輸入姓名' 
                  {...register("name",{
                    required:'姓名為必填'
                  })}
                  />
                  <div className='mt-2 text-danger'>
                    {errors.name?errors.name.message:''}
                  </div>
                </div>
              </div>
              <div className="py-3 row">
                <label htmlFor="email" className="col-sm-3 col-form-label">Email</label>
                <div className="col-sm-9">
                  <input type="email" className="form-control" id="email" placeholder='請輸入Email'
                  {...register("email",{
                    required:'Email為必填',
                    pattern:{
                      value:/^[a-zA-Z0-9._]{5,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message:'請輸入有效email格式'
                    },
                  })}
                  />
                  <div className='mt-2 text-danger'>
                    {errors.email?errors.email.message:''}
                  </div>
                </div>
              </div>
              <div className="py-3 row">
                <label htmlFor="tel" className="col-sm-3 col-form-label">收件人電話</label>
                <div className="col-sm-9">
                  <input type="tel" className="form-control" id="tel" placeholder='請輸入電話' 
                  {...register("tel",{
                    required:'電話為必填',
                    pattern:{
                      value:/^\d{8,}$/,
                      message:'請輸入有效電話格式'
                    }
                  })}
                  />
                   <div className='mt-2 text-danger'>
                    {errors.tel?errors.tel.message:''}
                  </div>
                </div>
              </div>
              <div className="py-3 row">
                <label htmlFor="address" className="col-sm-3 col-form-label">收件人地址</label>
                <div className="col-sm-9">
                  <input type="text" className="form-control" id="address" placeholder='請輸入地址'
                  {...register("address",{
                    required:'地址為必填',
                  })}
                  />
                  <div className='mt-2 text-danger'>
                    {errors.address?errors.address.message:''}
                  </div>
                </div>
              </div>
              <div className="row py-3">
                <label htmlFor="message" className="col-sm-3 col-form-label">留言</label>
                <div className="col-sm-9">
                  <textarea  rows='3' className="form-control" id="message" placeholder='請輸入留言'
                  {...register("message")}
                  />
                </div>
              </div>
              <div className="py-3 text-center">
                <button type='submit' className='btn btn-warning btn-lg'>
                  送出訂單
                </button>
              </div>
            </form>
          </div>
          {/* <!-- Modal --> */}
        </div>
        }
        <div className="modal fade" id="productModal" tabIndex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="productModalLabel"> 產品名稱：{selectedProduct.title}</h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="d-flex justify-content-center">
                    <img src={selectedProduct.imageUrl} alt="圖片" className='modal-img'/>
                  </div>
                  <div className='p text-center pt-3 '>
                    產品內容：{selectedProduct.content}
                  </div>
                  <div className='p text-center pt-3 '>
                    產品描述：{selectedProduct.description}
                  </div>
                  <div className='p text-center pt-3 '>
                    價錢：<del>原價：${selectedProduct.origin_price}</del>，
                    特價：${selectedProduct.price}
                  </div>
                  <div className='p text-center pt-3 d-flex align-items-center justify-content-center'>
                    購買數量：
                    <button className='btn btn-warning btn-sm' onClick={()=>handleModalChange(selectedProduct.num-1)} disabled={selectedProduct.num-1==0}>－</button>
                    <input type="number" min='1' value={selectedProduct.num} onChange={(e)=>handleModalChange(Number(e.target.value))}/>
                    <button className='btn btn-warning btn-sm' onClick={()=>handleModalChange(selectedProduct.num+1)}>＋</button>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-warning" onClick={()=>addCart(selectedProduct.id,selectedProduct.num)}>加入購物車</button>
                </div>
              </div>
            </div>
        </div>
    </>
  )
}

export default App

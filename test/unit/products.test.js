const productController = require('../../controller/products')
const productModel = require('../../models/Product')
const httpMocks = require('node-mocks-http')
const newProduct = require('../data/new-product.json')
const allProduct = require('../data/all-products.json')
const {Promise} = require("mongoose");

productModel.create = jest.fn();
productModel.find = jest.fn();
productModel.findById = jest.fn();
productModel.findByIdAndUpdate = jest.fn();
productModel.findByIdAndDelete = jest.fn();

const productId = "628514cf7aead1f021afc650"
const updateProduct = { name:"updateName", description:"update content"};
let req, res, next;

beforeEach(()=>{
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
})

describe('Product Controller Create', ()=>{
    beforeEach(()=>{
        req.body = newProduct;
    })
    test('createProduct 함수 생성', ()=>{
        expect(typeof productController.createProduct).toBe("function");
    })
    test('ProductModel.create 이 호출되어야 한다.', async ()=>{
        await productController.createProduct(req, res, next);
        expect(productModel.create).toBeCalledWith(req.body);
    })
    test('201 응답코드가 와야함.', async ()=>{
        await productController.createProduct(req,res,next);
        expect(res.statusCode).toBe(201);
        expect(res._isEndCalled()).toBeTruthy();
    })
    test('json body 가 응답으로 와야한다.', async ()=>{
        productModel.create.mockReturnValue(newProduct)
        await productController.createProduct(req, res, next);
        expect(res._getJSONData()).toStrictEqual(newProduct)
    })
    test('에러 처리가 정상적으로 되어야함', async ()=>{
        //몽고 DB 에러를 만들어줌
        const errorMessage = {message: "description property missing"};
        const rejectedPromise = Promise.reject(errorMessage);
        productModel.create.mockReturnValue(rejectedPromise);
        await productController.createProduct(req, res, next);
        expect(next).toBeCalledWith(errorMessage);
    })
})

describe("Product Controller Get", ()=>{
    test('getProducts 함수가 있어야 한다.', ()=>{
        expect(typeof productController.getProducts).toBe("function")
    })
    test('ProductModel.find({})가 호출되어야 한다.', async ()=>{
        await productController.getProducts(req, res, next);
        expect(productModel.find).toHaveBeenCalledWith({}) //파라미터가 어떤걸로 들어가는지
    })
    test('200 리턴 해야한다.', async ()=>{
        await productController.getProducts(req, res, next);
        expect(res.statusCode).toBe(200);
        expect(res._isEndCalled).toBeTruthy();
    })
    test('json body로 데이터를 클라이언트에 응답해야한다.', async () =>{
        productModel.find.mockReturnValue(allProduct);
        await productController.getProducts(req, res, next);
        expect(res._getJSONData()).toStrictEqual(allProduct);
    })
    test('getProducts 에러 발생 시 처리해줘야한다.' , async()=>{
        const errorMessage = {message: "Error finding product data"};
        const rejectedPromise = Promise.reject(errorMessage);
        //Promise.reject 객체로 error 상황을 만들어줌.
        //Mock.fn에 rejectedPromise를 넣어주면 catch로 빠지는 테스트케이스가 됨.
        productModel.find.mockReturnValue(rejectedPromise);
        await productController.getProducts(req, res, next);
        expect(next).toHaveBeenCalledWith(errorMessage);
    })
})

describe('Product Controller GetBtId', ()=>{
    test('getProductById는 함수여야 한다.', ()=>{
        expect(typeof productController.getProductById).toBe('function')
    })
    test('productModel.findbyid 호출', async () =>{
        req.params.productId = productId
        await productController.getProductById(req, res, next);
        expect(productModel.findById).toBeCalledWith(productId);
    })
    test('json body 응답코드 200 을 리턴해야한다.', async ()=>{
        productModel.findById.mockReturnValue(newProduct)
        await productController.getProductById(req, res, next);
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toStrictEqual(newProduct);
        expect(res._isEndCalled()).toBeTruthy();
    })
    test('404 리넡해줘야 한다. 아이템 없으면', async ()=>{
        productModel.findById.mockReturnValue(null);
        await productController.getProductById(req, res, next);
        expect(res.statusCode).toBe(404);
        expect(res._isEndCalled()).toBeTruthy();
    })
    test('에러 처리', async()=>{
        const errorMessage = {message: 'error'}
        const rejectedPromise = Promise.reject(errorMessage);
        productModel.findById.mockReturnValue(rejectedPromise);
        await productController.getProductById(req, res, next);
        expect(next).toHaveBeenCalledWith(errorMessage);
    })
})

describe('Product Controller Update', ()=>{
    test('updateProduct 는 function 이어야함', ()=>{
        expect(typeof productController.updateProduct).toBe('function')
    })
    test('productModel.findByIdUpdate 테스트', async ()=>{
        //실제 코드 돌아갈 때 필요한 값.
        req.params.productId = productId;
        req.body = { name:"updateName", description:"update content"};
        await productController.updateProduct(req, res, next);
        //spy를 하기 위해 model 쪽은 mocking을 함. 실제 코드를 돌리면 안됨과 동시에
        //jest에서 평가를 하기 위해 mock 함수가 필요.
        expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
            productId,
            { name:"updateName", description:"update content"},
            { new: true })
    })
    test('json body와 200 코드 리턴해야함', async () => {
        req.params.productId = productId;
        req.body = updateProduct;
        productModel.findByIdAndUpdate.mockReturnValue(updateProduct);
        await productController.updateProduct(req, res, next);
        expect(res._isEndCalled()).toBeTruthy();
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toStrictEqual(updateProduct);
    })
    test('업데이트 할 거 없으면 404 에러 발생시킴', async () =>{
        productModel.findByIdAndUpdate.mockReturnValue(null);
        await productController.updateProduct(req, res, next);
        expect(res.statusCode).toBe(404);
        expect(res._isEndCalled()).toBeTruthy();
    })
    test('업데이트 과정에서 에러 발생', async ()=>{
        const errorMessage = {message: 'error'}
        const rejectPromise = Promise.reject(errorMessage);
        productModel.findByIdAndUpdate.mockReturnValue(rejectPromise);
        await productController.updateProduct(req, res, next);
        expect(next).toHaveBeenCalledWith(errorMessage);
    })
})

describe('Product Contorll Delete', () => {
    test('deleteProduct 는 함수타입이어야 한다.', () =>{
        expect(typeof productController.deleteProduct).toBe('function');
    })
    test('product findByIdAndDelete 테스트', async () =>{
        req.params.productId = productId;
        await productController.deleteProduct(req, res, next);
        expect(productModel.findByIdAndDelete).toBeCalledWith(productId);
    })
    test('삭제 성공시 200 리턴', async ()=>{
        const deletedProduct = {name: 'deletedProduct', description: 'is is deleted'}
        productModel.findByIdAndDelete.mockReturnValue(deletedProduct);
        await productController.deleteProduct(req, res, next);
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toStrictEqual(deletedProduct);
        expect(res._isEndCalled()).toBeTruthy();
    })
    test('삭제 하려는 아이템 없을 때 에러처리', async ()=>{
        productModel.findByIdAndDelete.mockReturnValue(null);
        await productController.deleteProduct(req, res, next);
        expect(res.statusCode).toBe(404);
        expect(res._isEndCalled()).toBeTruthy();
    })
    test('삭제 하려고 하는데 에러났을 때 처리', async ()=>{
        const errorMessage = {message: 'error deleting'}
        const rejectedPromise = Promise.reject(errorMessage);
        productModel.findByIdAndDelete.mockReturnValue(rejectedPromise);
        await productController.deleteProduct(req, res, next);
        expect(next).toHaveBeenCalledWith(errorMessage);
    })
})
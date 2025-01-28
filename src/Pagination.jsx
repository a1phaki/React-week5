import PropTypes from 'prop-types';

function Pagination ({pageInfo, handlePageChange}){
    

    return(
        <div className="d-flex justify-content-center">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${!pageInfo.has_pre && 'disabled'}`} >
                    <button className="page-link" onClick={()=>handlePageChange(pageInfo.current_page-1)} >
                      上一頁
                    </button>
                  </li>
                  {
                    Array.from({ length: pageInfo.total_pages }).map((item,index)=>(
                      <li className={`page-item ${pageInfo.current_page === (index+1) && 'active'}`} key={index}>
                        <button className="page-link" onClick={()=>handlePageChange(index+1)} >
                          {index+1}
                        </button>
                      </li>
                    ))
                  }
                  <li className={`page-item ${!pageInfo.has_next && 'disabled'}`}>
                    <button className="page-link " onClick={()=>handlePageChange(pageInfo.current_page+1)} >
                      下一頁
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
    )
}

Pagination.propTypes = {
  pageInfo: PropTypes.shape({
    has_pre: PropTypes.bool.isRequired,
    has_next: PropTypes.bool.isRequired,
    current_page: PropTypes.number.isRequired,
    total_pages: PropTypes.number.isRequired,
  }).isRequired,
  handlePageChange: PropTypes.func.isRequired,
};


export default Pagination;
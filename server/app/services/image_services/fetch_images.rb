DEFAULT_PAGE_SIZE = 20

module ImageServices
  class FetchImages

    # @param page [Integer]
    # @param page_size [Integer]
    def initialize(page, page_size)
      @page = page || 1
      @page_size = page_size || DEFAULT_PAGE_SIZE
    end

    def call
      offset = (@page - 1) * @page_size
      Image.offset(offset).limit(@page_size)
    end

  end
end

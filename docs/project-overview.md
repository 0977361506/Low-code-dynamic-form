# Tài liệu Dự án: Low-Code Dynamic Form Builder

## Tổng quan dự án

**Low-Code Dynamic Form Builder** là một công cụ xây dựng giao diện động, cho phép người dùng thiết kế và tạo ra các form, trang web một cách trực quan thông qua giao diện kéo-thả (drag & drop). Dự án được xây dựng bằng **Angular 19** và **TailwindCSS**.

### Công nghệ sử dụng
- **Framework**: Angular 19 (Standalone Components)
- **Styling**: TailwindCSS
- **Language**: TypeScript
- **Build Tool**: Angular CLI

---

## Cấu trúc màn hình chính

Ứng dụng có **2 chế độ hoạt động chính** được quản lý qua thanh điều hướng trên cùng:

### 1. Chế độ Thiết kế (Builder Mode)
Đây là chế độ chính để thiết kế giao diện, bao gồm 3 khu vực chính:

```
┌────────────────────────────────────────────────────────────┐
│                    NAVBAR (Thanh điều hướng)               │
├──────────┬───────────────────────────────┬─────────────────┤
│          │                               │                 │
│ SIDEBAR  │          CANVAS               │  PROPERTY PANEL │
│          │       (Vùng thiết kế)         │  (Thuộc tính)   │
│ (Công    │                               │                 │
│  cụ)     │                               │                 │
│          │                               │                 │
└──────────┴───────────────────────────────┴─────────────────┘
```

#### **A. Thanh điều hướng (Navbar)**
- **Vị trí**: Cố định ở đầu trang, chiều cao 64px
- **Màu nền**: Trắng với viền dưới màu xám nhẹ
- **Logo & Tên ứng dụng**: "LowCode Pro - Angular 19 Edition"
- **Tab chuyển đổi chế độ**:
  - **Thiết kế**: Chế độ xây dựng giao diện
  - **Xem sản phẩm**: Chế độ xem kết quả cuối cùng
- **Nút chức năng**:
  - **Quick Preview**: Xem trước nhanh giao diện đang thiết kế
  - **Save JSON**: Xuất/Nhập dữ liệu dự án dưới dạng JSON

#### **B. Sidebar (Thanh công cụ bên trái)**
- **Vị trí**: Bên trái màn hình, chiều rộng 288px
- **Màu nền**: Trắng với viền phải
- **Tiêu đề**: "KÉO THẢ THÀNH PHẦN"
- **Danh sách các component có thể kéo thả**:
  1. **Khối chứa (Container)**: Vùng chứa các component khác
  2. **Văn bản (Text)**: Hiển thị nội dung văn bản
  3. **Nút bấm (Button)**: Nút tương tác với người dùng
  4. **Hình ảnh (Image)**: Hiển thị hình ảnh từ URL
  5. **Ô nhập liệu (Input)**: Ô nhập text đơn
  6. **Vùng nhập liệu (Textarea)**: Ô nhập text nhiều dòng
  7. **Bảng dữ liệu (Table)**: Hiển thị dữ liệu dạng bảng

- **Tương tác**:
  - **Click**: Thêm component vào Canvas
  - **Kéo thả**: Kéo component vào vị trí mong muốn trên Canvas

#### **C. Canvas (Vùng thiết kế trung tâm)**
- **Vị trí**: Trung tâm màn hình, chiếm phần lớn diện tích
- **Màu nền**: Xám nhạt (#f8fafc) với lưới chấm tròn nhỏ (grid pattern)
- **Chức năng**: 
  - Hiển thị tất cả các component được thêm vào
  - Hỗ trợ kéo thả để sắp xếp lại component
  - Click để chọn component (viền xanh khi được chọn)
  - Double-click để chỉnh sửa nội dung trực tiếp (inline editing)
  - Hiển thị các container với layout dạng flex

- **Cấu trúc phân cấp**:
  - **Root Level**: Container cha không có parent
  - **Child Level**: Các component con nằm trong container

#### **D. Property Panel (Bảng thuộc tính bên phải)**
- **Vị trí**: Bên phải màn hình, chiều rộng ~320px
- **Hiển thị khi**: Có component được chọn
- **Các tab cấu hình**:

  **Tab 1: Nội dung (Content)**
  - **Label**: Nhãn cho input/textarea
  - **Nội dung**: Text, URL, placeholder, hoặc dữ liệu bảng

  **Tab 2: Giao diện (Styles)**
  - **Kích thước**: Width (%), Height (px/auto)
  - **Màu sắc**: Background color, Text color
  - **Typography**: Font size, Text alignment (left/center/right)
  - **Spacing**: Padding, Border radius, Border width, Border color
  - **Layer**: Z-index

  **Tab 3: Hành động (Actions)**
  - **Loại action**:
    - `none`: Không có hành động
    - `alert`: Hiển thị thông báo
    - `console`: Log ra console
    - `api`: Gọi API (GET/POST/PUT/DELETE)
    - `popup`: Hiển thị popup (text/json/page)
    - `navigate`: Chuyển trang (cùng tab/tab mới)
  
  - **Cấu hình tùy theo loại**:
    - API: URL, Method
    - Popup: Title, Type, Content/Page ID
    - Navigate: Target URL, New tab option
    - Alert/Console: Message

  **Nút Delete**: Xóa component đang được chọn

---

### 2. Chế độ Xem sản phẩm (Viewer Mode)

Chế độ này cho phép xem và tương tác với kết quả cuối cùng như người dùng thực tế.

```
┌────────────────────────────────────────────────────────────┐
│                        NAVBAR                              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                  VIEWER AREA                               │
│         (Hiển thị form đã thiết kế)                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### **Đặc điểm**:
- Hiển thị giao diện giống như sản phẩm cuối cùng
- Hỗ trợ nhập liệu vào Input/Textarea
- Button có thể trigger action đã cấu hình
- Có thể nhập JSON để render trang mới
- Hỗ trợ nhiều trang (pages), chuyển đổi qua dropdown

---

## Các chức năng chính

### 1. Quản lý Component

#### **Thêm component**
- **Cách 1**: Click vào component trong Sidebar → component tự động thêm vào Canvas
- **Cách 2**: Kéo component từ Sidebar thả vào Canvas hoặc vào Container cụ thể
  
#### **Chọn component**
- Click vào component trong Canvas
- Component được chọn sẽ có viền màu xanh dương
- Property Panel bên phải hiển thị thông tin của component đó

#### **Chỉnh sửa nội dung trực tiếp**
- Double-click vào component (text, button, input, textarea)
- Nhập nội dung mới trực tiếp
- Nhấn Enter hoặc click ra ngoài để lưu

#### **Kéo thả sắp xếp lại**
- Kéo component trong Canvas để di chuyển
- Có thể di chuyển giữa các Container khác nhau
- Thứ tự hiển thị thay đổi theo vị trí thả

#### **Xóa component**
- Chọn component
- Click nút "Delete Component" trong Property Panel

### 2. Tùy chỉnh giao diện (Styling)

Mỗi component có thể tùy chỉnh các thuộc tính sau thông qua Property Panel:

- **Kích thước**: Width (%), Height (px)
- **Màu sắc**: Background, Text color (hỗ trợ color picker)
- **Font size**: Kích thước chữ (px)
- **Text alignment**: Left / Center / Right
- **Padding**: Khoảng cách bên trong (px)
- **Border**: Border radius, Border width, Border color
- **Z-index**: Thứ tự hiển thị trên các layer

### 3. Cấu hình hành động (Actions)

Button và các component có thể gắn các hành động khi người dùng tương tác:

#### **Alert**
- Hiển thị popup thông báo đơn giản
- Cấu hình: Message text

#### **Console Log**
- Ghi log ra console trình duyệt
- Cấu hình: Message text

#### **API Call**
- Gọi API endpoint
- Cấu hình: API URL, HTTP Method (GET/POST/PUT/DELETE)
- Response được hiển thị trong popup

#### **Popup**
- Hiển thị modal overlay
- 3 loại nội dung:
  - **Text**: Hiển thị message text
  - **JSON**: Hiển thị dữ liệu JSON được format
  - **Page**: Hiển thị một page khác trong dự án

#### **Navigate**
- Chuyển hướng đến URL khác
- Tùy chọn: Mở tab mới hoặc cùng tab

### 4. Preview & Export

#### **Quick Preview**
- Click nút "Quick Preview" trên Navbar
- Mở modal full-screen hiển thị giao diện đã thiết kế
- Cho phép tương tác với form (nhập liệu, click button, trigger action)
- Đóng bằng nút "Close" ở góc trên phải

#### **Save JSON**
- Click nút "Save JSON"
- Hiển thị JSON Viewer modal
- Có 2 tab:
  - **JSON View**: Hiển thị cấu trúc dữ liệu dạng JSON
  - **Import**: Nhập JSON để load dự án
- Có thể copy toàn bộ JSON hoặc tải file

### 5. Multi-page Support

Ứng dụng hỗ trợ nhiều trang trong cùng một dự án:

- **Mặc định**: Có 2 page:
  - `Main Page`: Trang trống
  - `Sample: Login Form`: Trang mẫu với form đăng nhập
  
- **Chuyển đổi trang**: Trong Viewer Mode, có dropdown để chọn trang

---

## Luồng hoạt động của các chức năng

### 📋 Luồng 1: Tạo một form đơn giản

```
1. Khởi động ứng dụng
   ↓
2. Ở Builder Mode, click "Khối chứa (Container)" trong Sidebar
   ↓
3. Container được thêm vào Canvas
   ↓
4. Kéo "Ô nhập liệu (Input)" từ Sidebar thả vào Container
   ↓
5. Click vào Input vừa tạo
   ↓
6. Trong Property Panel:
   - Tab Content: Đổi Label thành "Tên đăng nhập"
   - Tab Content: Đổi Placeholder thành "Nhập tên..."
   ↓
7. Kéo "Nút bấm (Button)" vào Container
   ↓
8. Double-click Button để đổi text thành "Đăng nhập"
   ↓
9. Chọn Button, vào tab Actions:
   - Chọn Type: "alert"
   - Nhập Message: "Đăng nhập thành công!"
   ↓
10. Click "Quick Preview" để xem kết quả
```

### 🎨 Luồng 2: Tùy chỉnh giao diện component

```
1. Chọn một component trong Canvas (ví dụ: Button)
   ↓
2. Click tab "Styles" trong Property Panel
   ↓
3. Thay đổi thuộc tính:
   - Background Color: Chọn màu xanh lá (#10b981)
   - Width: 50%
   - Border Radius: 20px
   - Font Size: 16px
   - Text Align: center
   ↓
4. Component tự động cập nhật ngay lập tức trên Canvas
   ↓
5. Tiếp tục điều chỉnh cho đến khi hài lòng
```

### 🔗 Luồng 3: Tạo Button gọi API

```
1. Tạo Button trong Canvas
   ↓
2. Chọn Button, vào tab "Actions"
   ↓
3. Chọn Action Type: "api"
   ↓
4. Cấu hình:
   - API URL: https://jsonplaceholder.typicode.com/users/1
   - Method: GET
   ↓
5. Click "Quick Preview"
   ↓
6. Trong Preview, click vào Button
   ↓
7. Hệ thống gọi API
   ↓
8. Response JSON được hiển thị trong popup
```

### 💾 Luồng 4: Xuất và Nhập dự án

#### **Xuất dự án**:
```
1. Thiết kế xong giao diện
   ↓
2. Click nút "Save JSON" trên Navbar
   ↓
3. Modal JSON Viewer hiển thị
   ↓
4. Tab "JSON View" hiển thị toàn bộ cấu trúc
   ↓
5. Copy JSON hoặc lưu vào file
```

#### **Nhập dự án**:
```
1. Click nút "Save JSON"
   ↓
2. Chuyển sang tab "Import"
   ↓
3. Paste JSON vào textarea
   ↓
4. Click "Load JSON"
   ↓
5. Dự án được tải lại với toàn bộ component và cấu hình
```

### 👁️ Luồng 5: Xem và tương tác với sản phẩm cuối cùng

```
1. Ở Builder Mode, thiết kế xong giao diện
   ↓
2. Click tab "Xem sản phẩm" trên Navbar
   ↓
3. Chuyển sang Viewer Mode
   ↓
4. Giao diện hiển thị giống sản phẩm thực tế
   ↓
5. Người dùng có thể:
   - Nhập liệu vào Input/Textarea
   - Click Button để trigger action
   - Xem popup/navigate/API response
   ↓
6. Click "Thiết kế" để quay lại chỉnh sửa
```

### 🔄 Luồng 6: Di chuyển và sắp xếp component

```
1. Có nhiều component trong Canvas
   ↓
2. Click và giữ component muốn di chuyển
   ↓
3. Kéo component đến vị trí mới (trong cùng Container hoặc sang Container khác)
   ↓
4. Thả component
   ↓
5. Component được di chuyển và thứ tự hiển thị thay đổi
```

### 🗑️ Luồng 7: Xóa component

```
1. Click vào component muốn xóa
   ↓
2. Property Panel hiển thị thông tin component
   ↓
3. Scroll xuống cuối Property Panel
   ↓
4. Click nút "Delete Component" (màu đỏ)
   ↓
5. Component và tất cả component con (nếu là Container) bị xóa khỏi Canvas
```

---

## Cấu trúc dữ liệu

### Component Structure
Mỗi component trong hệ thống có cấu trúc:

```typescript
{
  id: string,              // ID duy nhất
  type: ComponentType,     // text | button | image | container | input | textarea | table
  content: string,         // Nội dung hiển thị
  label?: string,          // Nhãn (cho input/textarea)
  parentId: string | null, // ID của container cha (null nếu là root)
  styles: {
    width: number,         // % (0-100)
    height: number,        // px hoặc 0 (auto)
    backgroundColor: string,
    color: string,
    fontSize: number,      // px
    borderRadius: number,  // px
    padding: number,       // px
    textAlign: 'left' | 'center' | 'right',
    zIndex: number,
    borderWidth: number,   // px
    borderColor: string
  },
  action: {
    type: 'none' | 'api' | 'popup' | 'navigate' | 'alert' | 'console',
    // Các field tùy theo type:
    apiUrl?: string,
    apiMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE',
    popupTitle?: string,
    popupType?: 'text' | 'json' | 'page',
    message?: string,
    popupContentJson?: string,
    popupTargetId?: string,
    targetUrl?: string,
    newTab?: boolean
  }
}
```

### Page Structure
```typescript
{
  id: string,              // ID của page
  name: string,            // Tên page
  components: Component[]  // Mảng các component trong page
}
```

### App Schema
```typescript
{
  pages: Page[],           // Danh sách các page
  activePageId: string     // ID của page đang active
}
```

---

## Tương tác giữa các màn hình

```
┌─────────────────────────────────────────────────────────────┐
│                        USER                                 │
└──────────────┬──────────────────────────────────┬───────────┘
               │                                  │
               ▼                                  ▼
       ┌──────────────┐                  ┌──────────────┐
       │    NAVBAR    │◄────────────────►│   SIDEBAR    │
       └──────┬───────┘                  └──────┬───────┘
              │                                 │
              │ Chuyển đổi Mode                 │ Emit addComponent
              │ Trigger Preview/Export          │
              ▼                                 ▼
       ┌─────────────────────────────────────────┐
       │          APP COMPONENT                  │
       │      (State Management)                 │
       │  - pages[]                              │
       │  - activePageId                         │
       │  - selectedId                           │
       │  - isPreview                            │
       │  - showJson                             │
       └────┬──────────────────┬─────────────────┘
            │                  │
            ▼                  ▼
    ┌───────────────┐   ┌────────────────────┐
    │    CANVAS     │   │  PROPERTY PANEL    │
    │               │   │                    │
    │ - Render      │   │ - Update Content   │
    │ - Select      │   │ - Update Styles    │
    │ - Drag/Drop   │   │ - Update Action    │
    │ - Delete      │   │ - Delete           │
    └───────────────┘   └────────────────────┘
            │
            ▼
    ┌────────────────────┐
    │  PREVIEW / VIEWER  │
    │                    │
    │ - Render final UI  │
    │ - Handle Actions   │
    │ - Form Values      │
    └────────────────────┘
```

### Luồng dữ liệu chính:

1. **Thêm component**: 
   `Sidebar → App Component → Canvas render`

2. **Chọn component**: 
   `Canvas click → App Component update selectedId → Property Panel hiển thị`

3. **Cập nhật thuộc tính**: 
   `Property Panel emit → App Component update → Canvas re-render`

4. **Preview**: 
   `Navbar click → App Component set isPreview = true → Preview modal hiển thị`

5. **Export/Import**: 
   `Navbar click → JSON Viewer modal → App Component load/save data`

---

## Đặc điểm kỹ thuật nổi bật

### 1. Reactive State Management
- Sử dụng Angular Signals để quản lý state
- Tự động re-render khi state thay đổi
- Computed values cho performance tốt hơn

### 2. Drag & Drop System
- Hỗ trợ kéo từ Sidebar vào Canvas
- Kéo thả giữa các Container
- Sắp xếp lại thứ tự component
- Visual feedback khi drag

### 3. Inline Editing
- Double-click để chỉnh sửa trực tiếp
- Hỗ trợ text, button, input, textarea
- Lưu tự động khi blur hoặc nhấn Enter

### 4. Hierarchical Component Structure
- Container có thể chứa nhiều component con
- Hỗ trợ nested containers (container trong container)
- Tự động xóa component con khi xóa container cha

### 5. Multi-page Support
- Quản lý nhiều trang trong một dự án
- Chuyển đổi trang dễ dàng
- Mỗi trang có state riêng

### 6. Action System
- Linh hoạt với nhiều loại action
- Cấu hình dễ dàng qua UI
- Hỗ trợ API call, popup, navigation

### 7. Export/Import
- Xuất toàn bộ dự án dưới dạng JSON
- Nhập JSON để khôi phục dự án
- Dễ dàng chia sẻ và backup

---

## Hướng dẫn sử dụng cơ bản

### Bước 1: Khởi tạo dự án
1. Mở ứng dụng → Hiển thị Builder Mode
2. Mặc định có 2 page: "Main Page" (trống) và "Sample: Login Form" (mẫu)

### Bước 2: Tạo giao diện
1. Click hoặc kéo component từ Sidebar vào Canvas
2. Container sẽ tự động được tạo để chứa component
3. Thêm nhiều component vào cùng Container bằng cách kéo thả

### Bước 3: Tùy chỉnh
1. Click chọn component
2. Sử dụng Property Panel để:
   - Đổi nội dung (tab Content)
   - Thay đổi giao diện (tab Styles)
   - Gắn hành động (tab Actions)

### Bước 4: Sắp xếp
1. Kéo thả component để di chuyển vị trí
2. Di chuyển giữa các Container khác nhau
3. Xóa component không cần thiết

### Bước 5: Xem trước và Xuất
1. Click "Quick Preview" để xem kết quả
2. Click "Save JSON" để xuất dự án
3. Chuyển sang "Xem sản phẩm" để test như người dùng thực

---

## Kết luận

**Low-Code Dynamic Form Builder** là một công cụ mạnh mẽ giúp người dùng tạo ra các giao diện web động mà không cần viết code. Với giao diện trực quan, hệ thống kéo-thả linh hoạt, và các tính năng tùy chỉnh phong phú, ứng dụng phù hợp cho:

- **Rapid Prototyping**: Tạo prototype nhanh chóng
- **Form Builder**: Xây dựng các form phức tạp
- **Landing Page Creator**: Thiết kế landing page đơn giản
- **UI Mockup Tool**: Công cụ mockup giao diện

Điểm mạnh của ứng dụng:
- ✅ Giao diện trực quan, dễ sử dụng
- ✅ Không cần kiến thức lập trình
- ✅ Hỗ trợ kéo thả linh hoạt
- ✅ Tùy chỉnh giao diện chi tiết
- ✅ Hệ thống action phong phú
- ✅ Xuất/Nhập JSON dễ dàng
- ✅ Multi-page support
- ✅ Preview real-time

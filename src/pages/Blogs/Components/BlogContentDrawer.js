import ReactMarkdown from 'react-markdown'
import DataItem from "components/DataItem";
import Drawer from "components/Drawer";
import MultiLanguagesItem from "components/MultiLanguage"

const BlogContentDrawer = ({ openDrawer, onClose, blog }) => {
  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem
        icon="menu-board"
        title="Blog Content"
        value={blog?.title?.en}
      />
      <div className="mt-8 space-y-6">
        <MultiLanguagesItem
          titleClassName="w-6"
          languagePack={[
            { title: "EN", detail: blog?.title?.en },
            { title: "VN", detail: blog?.title?.vi },
          ]}
        />

        <div className="flex space-x-4">
          <span className="text-primary font-bold">
            EN
          </span>
          <div className="markdown">
            <ReactMarkdown children={blog?.content?.en} />
          </div>
        </div>

        <div className="flex space-x-4">
          <span className="text-primary font-bold">
            VI
          </span>
          <div className="markdown">
            <ReactMarkdown children={blog?.content?.vi} />
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default BlogContentDrawer;

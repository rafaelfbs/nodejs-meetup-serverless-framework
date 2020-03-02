import React from "react";
import ReactDOM from "react-dom";

const getPresignedData = async () => {
    return fetch('http://localhost:3000/presign-upload').then(res => res.json());
};

const getImageLabels = async (image) => {
    return fetch(`http://localhost:3000/image-analysis/${image}`)
        .then(res => res.json())
        .then(res => res.labels);
}

const createUploadFormData = async (file, signedPostData) => {
    const formData = new FormData();
    Object.keys(signedPostData.fields).forEach(field => formData.append(field, signedPostData.fields[field]));

    formData.append("Content-Type", file.type);
    formData.append("acl", "public-read");
    formData.append("file", file);

    return formData;
};

const createUploadResponse = async (res, signedPostData) => {
    const success = res.status < 400;
    const key = signedPostData.fields.key;

    if (success) {
        const labels = await getImageLabels(key);
        return { success, labels, url: `https://${signedPostData.fields.bucket}.s3.amazonaws.com/${signedPostData.fields.key}` };
    }

    return { success, error: new Error(res.statusText) };
}

const uploadFile = async (file) => {
    const signedPostData = await getPresignedData();
    const formData = await createUploadFormData(file, signedPostData);

    return fetch(signedPostData.url, {
        method: "POST",
        body: formData
    })
    .then(res => createUploadResponse(res, signedPostData))
    .catch(error => ({ success: false, error }));
};

const ImageResult = ({ data }) => (
    <div>
        <img src={data.url} alt="image" style={{ width: '300px' }}></img>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Confidence</th>
                </tr>
            </thead>
            <tbody>
                {data.labels.map((it, index) => (
                    <tr key={index}>
                        <td>{it.Name}</td>
                        <td>{it.Confidence}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const App = () => {
    const [data, setData] = React.useState(null);
    const [uploadResult, setUploadResult] = React.useState({});
    const fileRef = React.useRef();

    const handleSubmit = React.useCallback(e => {
        e.preventDefault();

        uploadFile(data)
            .then(res => {
                setUploadResult(res)
                return analyzeImage(res.key);
            });
    });

    return (
        <form onSubmit={handleSubmit}>
            <input type="file" ref={fileRef} onChange={() => setData(fileRef.current.files[0])} />
            <div>
                <button type="submit">Upload File</button>
            </div>
            {uploadResult.success && <ImageResult data={uploadResult} />}
            {uploadResult.error && <div>Upload Error: {uploadResult.error.message}!</div>}
        </form>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));

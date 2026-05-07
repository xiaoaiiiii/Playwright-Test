import sys
import cv2
import numpy as np
from math import atan2, cos, sin, sqrt, pi


# 加载图像并进行预处理
def load_and_preprocess_image(image_path):
    # 读取图像
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"无法加载图像: {image_path}")
    # 转换为灰度图
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return image, gray


# 使用特征点检测和匹配找到两个图像之间的单应性矩阵
def find_homography(image1_gray, image2_gray, use_sift=True):
    # 确保坐标有效
    h1, w1 = image1_gray.shape[:2]
    h2, w2 = image2_gray.shape[:2]
    x1_1, y1_1 = max(0, 200), max(0, 0)
    x2_1, y2_1 = min(w1, w1), min(h1, h1 - 50)
    x1_2, y1_2 = max(0, 200), max(0, 0)
    x2_2, y2_2 = min(w2, w2), min(h2, h2 - 50)

    # # 创建ROI掩码
    mask1 = np.zeros((h1, w1), dtype=np.uint8)
    mask1[y1_1:y2_1, x1_1:x2_1] = 255

    mask2 = np.zeros((h2, w2), dtype=np.uint8)
    mask2[y1_2:y2_2, x1_2:x2_2] = 255

    if use_sift:
        # 使用SIFT算法（对旋转更鲁棒）
        sift = cv2.SIFT_create(1000)

        # 检测关键点和计算描述符
        kp1, des1 = sift.detectAndCompute(image1_gray, mask1)
        kp2, des2 = sift.detectAndCompute(image2_gray, mask2)

        # 使用FLANN匹配器
        FLANN_INDEX_KDTREE = 1
        index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
        search_params = dict(checks=50)

        flann = cv2.FlannBasedMatcher(index_params, search_params)
        matches = flann.knnMatch(des1, des2, k=2)

        # 应用比率测试
        good_matches = []
        for m, n in matches:
            if m.distance < 0.7 * n.distance:
                good_matches.append(m)

        if len(good_matches) < 10:
            # print(f"警告: 找到的匹配点过少 ({len(good_matches)})，可能无法准确对齐")
            print(1000)
            return None, good_matches, None, kp1, kp2

        # 提取匹配点的坐标
        src_pts = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(
            -1, 1, 2
        )
        dst_pts = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(
            -1, 1, 2
        )

        # 使用RANSAC算法计算单应性矩阵
        H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

        return H, good_matches, mask, kp1, kp2
    else:
        # 原始的ORB算法
        orb = cv2.ORB_create(1000)

        # 检测关键点和计算描述符
        kp1, des1 = orb.detectAndCompute(image1_gray, mask1)
        kp2, des2 = orb.detectAndCompute(image2_gray, mask2)

        # 创建BFMatcher对象
        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

        # 匹配描述符
        matches = bf.match(des1, des2)

        # 按距离排序
        matches = sorted(matches, key=lambda x: x.distance)

        # 提取匹配点的坐标
        src_pts = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
        dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)

        # 使用RANSAC算法计算单应性矩阵
        H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

        return H, matches, mask, kp1, kp2


# 使用单应性矩阵对齐图像
def align_image(image, H, shape):
    # 使用单应性矩阵进行透视变换
    aligned_image = cv2.warpPerspective(image, H, (shape[1], shape[0]))
    return aligned_image


# 创建特征点匹配图
def create_matches_image(
    img1,
    img2,
    kp1,
    kp2,
    matches,
    mask,
    match_color=(0, 255, 0),
    single_point_color=(255, 0, 0),
    matchesMask=None,
    flags=0,
):
    if matchesMask is None and mask is not None:
        matchesMask = mask.ravel().tolist()

    draw_params = dict(
        # matchColor=match_color,
        # singlePointColor=single_point_color,
        matchesMask=matchesMask,
        flags=flags,
    )

    matches_img = cv2.drawMatches(img1, kp1, img2, kp2, matches, None, **draw_params)
    return matches_img


# 对比两个图像，返回差异图像和相似度分数
def compare_images(image1, image2):
    # 确保两个图像大小相同
    if image1.shape != image2.shape:
        image2 = cv2.resize(image2, (image1.shape[1], image1.shape[0]))

    # 计算差异图像
    diff = cv2.absdiff(image1, image2)

    # 将差异图像转换为灰度图
    diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)

    # 计算相似度分数（0表示完全相同，255表示完全不同）
    similarity_score = np.mean(diff_gray)

    return similarity_score


# 旋转图片
def rotate_image(image, angle, width, height):
    # 计算旋转中心
    center = (width // 2, height // 2)

    # 获取旋转矩阵
    M = cv2.getRotationMatrix2D(center, angle, 1.0)

    # 执行旋转
    rotated = cv2.warpAffine(image, M, (width, height))

    return rotated


# 根据匹配点计算旋转角度
def calculate_rotation_angle(kp1, kp2, matches):
    if len(matches) < 4:  # 至少需要4个点来计算单应性矩阵
        raise ValueError("匹配点数量不足，无法计算旋转角度")

    # 获取匹配点的坐标
    src_pts = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
    dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)

    # 计算单应性矩阵
    H, _ = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

    # 从单应性矩阵中提取旋转角度
    if H is not None:
        # 对于纯旋转，单应性矩阵的左上角2x2子矩阵为旋转矩阵
        a = H[0, 0]
        b = H[0, 1]
        angle = atan2(b, a) * 180 / pi
        return angle
    else:
        raise ValueError("无法计算单应性矩阵")


def main():
    image1 = sys.argv[1]
    image2 = sys.argv[2]
    imageDiff = sys.argv[3]

    try:
        # 加载并预处理图像
        original1, gray1 = load_and_preprocess_image(image1)
        original2, gray2 = load_and_preprocess_image(image2)
        aligned = original2
        # 找到单应性矩阵和特征点
        H, matches, mask, kp1, kp2 = find_homography(gray1, gray2, False)

        angle = calculate_rotation_angle(kp1, kp2, matches)
        if angle:
            # 第二张图片保持原始角度或根据需要调整
            # h1, w1 = original1.shape[:2]
            h2, w2 = original2.shape[:2]
            # original1 = rotate_image(original1, 0, w1, h1)
            aligned = rotate_image(original2, 0, w2, h2)

        # if H is None:
        #     aligned = aligned
        # else:
        #     # 对齐图像
        #     aligned = align_image(aligned, H, original1.shape)

        # 比较图像
        similarity_score = compare_images(original1, aligned)

        if imageDiff:
            # 创建特征点匹配图
            matches_img = create_matches_image(
                original1,
                original2,
                kp1,
                kp2,
                matches,
                mask,
                match_color=(0, 255, 0),
                single_point_color=(255, 0, 0),
                matchesMask=mask.ravel().tolist(),
                flags=2,
            )
            info_text = (
                f"result: {similarity_score<15}"
            )
            h1, w1 = matches_img.shape[:2]
            cv2.putText(
                matches_img,
                info_text,
                (w1//2 - 200, 18),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 0, 255),
                1,
            )
            # 保存特征点匹配图
            cv2.imwrite(imageDiff, matches_img)

        # 输出结果
        # print(f"相似度分数: {similarity_score:.2f} (分数越低表示越相似)")
        # if similarity_score < 10:
        # print("结论: 图片内容基本一致")
        # elif similarity_score < 30:
        # print("结论: 图片内容大部分一致，但存在一些差异")
        # else:
        # print("结论: 图片内容存在明显差异")

        print(similarity_score)

    except Exception as e:
        # print(f"错误: {str(e)}")
        pass


# 设置标准输出为UTF-8编码
def set_utf8_stdout():
    try:
        import io

        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")
    except:
        print("无法设置UTF-8编码，中文可能无法正常显示")


if __name__ == "__main__":
    set_utf8_stdout()
    main()
